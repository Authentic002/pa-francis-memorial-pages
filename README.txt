PA. FRANCIS OLUREMI ADEMAKINWA MEMORIAL WEBSITE
================================================

The original visual design and family photographs are retained. The red-outfit studio photo is used as a subdued countdown background. Family-approved contribution details are visible:
- GTBank | Account name: Okeme Folashade | Account number: 0013050619
- PalmPay | Account name: Funmilayo Toyin Koya | Account number: 9027084220

The site now includes a real Cloudflare Pages Functions RSVP endpoint, D1 schema, private family dashboard, email notifications, ticket references, guest email confirmations when an email is provided, RSVP update by ticket reference, and a scheduled reminder Worker. THESE FEATURES WILL NOT WORK UNTIL YOU CONFIGURE THE CLOUDFLARE RESOURCES AND EMAIL SECRET BELOW AND DEPLOY BOTH PROJECTS. I cannot access or publish into your Cloudflare account from this chat.

DEPLOYMENT CHECKLIST
--------------------
1. Create a Cloudflare D1 database named `pa-francis-memorial-rsvps`.
2. In D1 > Console, run the SQL from `database/schema.sql`.
3. Copy the database ID into BOTH `wrangler.toml` and `reminder-worker/wrangler.toml` where it says REPLACE_WITH_YOUR_D1_DATABASE_ID.
4. Configure a verified sender address with an email provider such as Resend. The recipient notification address is richshadkoncept04@gmail.com. The sender must be an address/domain you control and the provider must verify it.
5. Install Node.js and Wrangler (`npm install -g wrangler`) and sign in (`wrangler login`).
6. Deploy the Pages project from this folder using `wrangler pages deploy . --project-name pa-francis-memorial-pages`. For the most reliable Pages Functions + D1 binding setup, configure the D1 binding in Cloudflare Pages > Settings > Functions > D1 database bindings: variable name `RSVPS`, choose `pa-francis-memorial-rsvps`.
7. In Cloudflare Pages > Settings > Variables and Secrets, set these for Production (and Preview if desired):
   - `RESEND_API_KEY` = your private Resend API key (secret)
   - `EMAIL_FROM` = the verified sender address, e.g. `Memorial RSVP <rsvp@your-verified-domain>` (use your actual verified domain)
   - `ADMIN_PASSWORD` = a long, unique password shared only with the owner and selected family members
   - `DEBUG_ERRORS` = `false`
   Do not place API keys or passwords in frontend code or commit them to public repositories.
8. Deploy the reminder worker from `reminder-worker/` with `wrangler deploy`. Set Worker secrets `RESEND_API_KEY` and `EMAIL_FROM` and bind the same D1 database as `RSVPS`. The cron runs at 08:00 UTC / 09:00 Nigeria time each day and sends only on 12 Dec, 18 Dec, and 19 Dec 2026 to guests who accepted and supplied an email.
9. Visit `/admin/`, sign in with the ADMIN_PASSWORD, and test admin visibility.
10. Before announcing the live URL, test an acceptance and a decline using a real email address you control. Confirm the owner notification reaches richshadkoncept04@gmail.com; confirm guest email/ticket, update using the ticket reference, dashboard privacy, and reminder setup. Remove test registrations before launch.

EMAIL BEHAVIOUR
----------------
- Both “Joyfully Accept” and “Respectfully Decline” are configured to send a notification to richshadkoncept04@gmail.com.
- Guests receive a confirmation email only if they enter an email address.
- The response screen displays a unique ticket reference. The guest can enter that reference into the RSVP form later to update the existing record.
- Email sending requires a valid Resend API key and verified EMAIL_FROM sender. If not configured, submissions will not be fully processed and the site must not be treated as live.
- Admin dashboard: `/admin/`. Protect it with a strong ADMIN_PASSWORD. This is a shared-password starter; for a larger group, replace it with individual authenticated accounts before broad distribution.

REMINDERS
---------
Scheduled reminders are set for 12 Dec, 18 Dec, and 19 Dec 2026 at 09:00 Nigeria time. Only accepted guests with an email address receive these reminders. Test by reviewing Worker logs and the email provider logs.

RSVP DATA
---------
Stored in Cloudflare D1: guest name, phone, optional email, invitation category, attendee count, accept/decline response, optional note, ticket reference, and timestamps. The dashboard is not public and requires the admin password.

IMPORTANT
---------
The files are prepared for deployment but are not live until you deploy them in your Cloudflare account and add the D1 binding and email secrets. Do not share your admin password or email API key in this chat. Cloudflare account access, a verified sender domain, and successful end-to-end tests are still required before the site can be described as live.
