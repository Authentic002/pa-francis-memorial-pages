CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_reference TEXT NOT NULL UNIQUE,
  guest_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT NOT NULL,
  attendees INTEGER NOT NULL DEFAULT 1,
  response TEXT NOT NULL CHECK (response IN ('Joyfully Accept','Respectfully Decline')),
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  reminder_12_sent INTEGER NOT NULL DEFAULT 0,
  reminder_18_sent INTEGER NOT NULL DEFAULT 0,
  reminder_day_sent INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_rsvps_response ON rsvps(response);
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);
