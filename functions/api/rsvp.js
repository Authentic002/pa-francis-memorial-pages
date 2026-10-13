const NOTIFY_EMAIL = 'richshadkoncept04@gmail.com';
const EVENT = 'Celebration of Life for Pa. Francis Oluremi Ademakinwa — Saturday, 19 December 2026 at 12:00 noon, ICAN Centre, Amuwo Odofin, Lagos.';
const allowedResponses = new Set(['Joyfully Accept', 'Respectfully Decline']);
const allowedCategories = new Set([
  'Mrs. Ademakinwa Iyabo', 'Diana Ronke Ademakinwa Botu (Mr. & Mrs.)',
  'Tolulope Ademakinwa Apaleoha (Mr. & Mrs.)', 'Funmilayo Ademakinwa Koya (Mr. & Mrs.)',
  'Segun Ademakinwa (Pappy Shegzy) (Mr. & Mrs.)', 'Folashade Ademakinwa Okeme (Mr. & Mrs.)',
  'Ibiyemi Ademakinwa Iwalokun (Mr. & Mrs.)', 'Damilola Ademakinwa Amangele (Mr. & Mrs.)'
]);
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const clean = (v, max=500) => String(v ?? '').trim().slice(0,max);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) throw new Error('Email service is not configured.');
  const r = await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:env.EMAIL_FROM,to:[to],subject,html})});
  if (!r.ok) throw new Error(`Email provider returned ${r.status}`);
}
export async function onRequestPost({request, env}) {
  if (!env.RSVPS) return json({error:'Registration database is not connected yet.'},503);
  let b; try { b=await request.json(); } catch { return json({error:'Please submit a valid form.'},400); }
  const guestName=clean(b.guestName,120), phone=clean(b.guestPhone,40), email=clean(b.guestEmail,180), category=clean(b.guestCategory,120), response=clean(b.response,40), note=clean(b.guestNote,500), attendees=Number(b.attendees), ticket=clean(b.ticketReference,80);
  if (!guestName || !phone || !allowedCategories.has(category) || !allowedResponses.has(response) || !Number.isInteger(attendees) || attendees<1 || attendees>30) return json({error:'Please check the required fields and try again.'},400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error:'Please enter a valid email address.'},400);
  const now = new Date().toISOString(); let ticketReference=ticket; let existing=null;
  if (ticket) existing=await env.RSVPS.prepare('SELECT ticket_reference FROM rsvps WHERE ticket_reference=?').bind(ticket).first();
  if (ticket && !existing) return json({error:'That ticket reference was not found. Please submit a new RSVP or contact the family.'},404);
  if (!ticketReference) ticketReference='PAF-'+crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase();
  try {
    if (existing) await env.RSVPS.prepare('UPDATE rsvps SET guest_name=?, phone=?, email=?, category=?, attendees=?, response=?, note=?, updated_at=? WHERE ticket_reference=?').bind(guestName,phone,email||null,category,attendees,response,note||null,now,ticketReference).run();
    else await env.RSVPS.prepare('INSERT INTO rsvps (ticket_reference,guest_name,phone,email,category,attendees,response,note,created_at,updated_at,reminder_12_sent,reminder_18_sent,reminder_day_sent) VALUES (?,?,?,?,?,?,?,?,?,?,0,0,0)').bind(ticketReference,guestName,phone,email||null,category,attendees,response,note||null,now,now).run();
    const statusLabel = response==='Joyfully Accept'?'ACCEPTED':'DECLINED';
    const adminHtml=`<h2>New/updated memorial RSVP: ${esc(statusLabel)}</h2><p><b>Guest:</b> ${esc(guestName)}</p><p><b>Response:</b> ${esc(response)}</p><p><b>Phone:</b> ${esc(phone)}</p><p><b>Email:</b> ${esc(email||'Not supplied')}</p><p><b>Invitation category / invited by:</b> ${esc(category)}</p><p><b>Attendees:</b> ${attendees}</p><p><b>Ticket reference:</b> ${esc(ticketReference)}</p><p><b>Note:</b> ${esc(note||'None')}</p><p>${esc(EVENT)}</p>`;
    await sendEmail(env,NOTIFY_EMAIL,`Memorial RSVP ${statusLabel}: ${guestName}`,adminHtml);
    if (email) await sendEmail(env,email,`Your memorial RSVP — ${ticketReference}`,`<h2>Thank you, ${esc(guestName)}</h2><p>Your response has been recorded: <b>${esc(response)}</b>.</p><p><b>Invitation category / invited by:</b> ${esc(category)}</p><p><b>Number attending:</b> ${attendees}</p><p><b>Your reference:</b> ${esc(ticketReference)}</p><p>Keep this reference to update your response later. Return to the RSVP form and enter this reference when updating.</p><p>${esc(EVENT)}</p><p>With love, the Ademakinwa family</p>`);
    return json({ok:true,ticketReference,updated:!!existing,response,guestName,category,attendees,emailSent:true});
  } catch(e) { return json({error:'Your RSVP could not be fully processed. Please try again or contact the family. '+(env.DEBUG_ERRORS==='true'?e.message:'')},502); }
}
