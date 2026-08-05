
-- ========================================================
-- 1. FACILITIES
-- ========================================================
INSERT INTO facilities (
    facility_code,
    facility_name,
    location,
    description,
    opening_time,
    closing_time,
    slot_duration_mins,
    status
) VALUES
(
    'FAC1',
    'Tennis Court',
    'Level 4 Rooftop, Block A',
    'Maximum 4 players allowed per booking. Non-marking sports shoes must be worn at all times. Rackets and tennis balls are not provided.',
    '08:00:00',
    '22:00:00',
    120,
    'Available'
),

(
    'FAC2',
    'BBQ Pit',
    'Clubhouse Poolside, West Wing',
    'Equipped with 1 electrical pit and charcoal grids. Great for smaller gatherings. Users must clean up after use. Deposit required.',
    '17:00:00',
    '22:00:00',
    300,
    'Available'
),
(
    'FAC3',
    'Function Room',
    'Clubhouse Level 2',
    'Fully air-conditioned multi-purpose room. Includes 30 chairs, 5 tables, and an audio system. Ideal for private family events and meetings.',
    '07:00:00',
    '22:00:00',
   300,
    'Available'
)

-- ========================================================
-- 2. RESIDENTS
-- ========================================================
INSERT INTO residents (
    email,
    unit_number,
    resident_name,
    contact_number,
    password,
    status
) VALUES
(
    'resident1@condo.com',
    '08-12',
    'Amira Tan',
    '91234567',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
),
(
    'resident2@condo.com',
    '10-05',
    'Daniel Lim',
    '98765432',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
),
(
    'resident3@condo.com',
    '06-18',
    'Siti Nur',
    '92345678',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
),
(
    'resident4@condo.com',
    '12-09',
    'Koh Wei Ming',
    '93456789',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
),
(
    'resident5@condo.com',
    '03-22',
    'Nurul Iman',
    '94567890',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
),
(
    'resident6@condo.com',
    '15-14',
    'Tan Jun Hao',
    '95678901',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
),
(
    'resident7@condo.com',
    '09-03',
    'Aisyah Rahman',
    '96789012',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
),
(
    'resident8@condo.com',
    '11-27',
    'Lim Xuan Wei',
    '97890123',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
),
(
    'resident9@condo.com',
    '04-08',
    'Farah Aziz',
    '98901234',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
),
(
    'resident10@condo.com',
    '18-16',
    'Goh Jie En',
    '99012345',
    '$2b$12$Ydi1JJLvK6yriCHn9qxtuOwrUuA5ruPct2W6.riT0nSj6wa9GgCZC',
    'Active'
);
-- ========================================================
-- 3. BOOKINGS
-- ========================================================
INSERT INTO bookings (
  booking_code,
  unit_number,
  resident_name,
  email,
  contact_number,
  facility_id,
  booking_date,
  start_time,
  end_time,
  status,
  notes
) VALUES
(
  'BKG1',
  '08-12',
  'Amira Tan',
  'resident1@condo.com',
  '91234567',
  1,
  '2026-08-12',
  '18:00:00',
  '20:00:00',
  'Booked',
  'Tennis practice session'
),
(
  'BKG2',
  '10-05',
  'Daniel Lim',
  'resident2@condo.com',
  '98765432',
  2,
  '2026-08-13',
  '17:00:00',
  '22:00:00',
  'Booked',
  'BBQ gathering'
),
(
  'BKG3',
  '06-18',
  'Siti Nur',
  'resident3@condo.com',
  '92345678',
  3,
  '2026-08-14',
  '07:00:00',
  '12:00:00',
  'Booked',
  'Family event'
),
(
  'BKG4',
  '12-09',
  'Koh Wei Ming',
  'resident4@condo.com',
  '93456789',
  1,
  '2026-08-15',
  '20:00:00',
  '22:00:00',
  'Completed',
  'Evening tennis session'
),
(
  'BKG5',
  '03-22',
  'Nurul Iman',
  'resident5@condo.com',
  '94567890',
  2,
  '2026-08-16',
  '17:00:00',
  '22:00:00',
  'Cancelled',
  'Cancelled by resident'
);

-- ========================================================
-- 4. STAFF
-- ========================================================
INSERT INTO staff (
    management_name,
    email,
    contact_number,
    password
) VALUES
(
    'John Tan',
    'john.tan@condo.com',
    '99998888',
    '$2b$12$Zixrditgg70H/RBU7pXXvOMV9BDYzpSWmGMUdN3n7gF.onH7Y18pS'
),
(
    'Lina Lim',
    'lina.lim@condo.com',
    '99997777',
    '$2b$12$Zixrditgg70H/RBU7pXXvOMV9BDYzpSWmGMUdN3n7gF.onH7Y18pS'
),
(
    'Daniel Koh',
    'daniel.koh@condo.com',
    '99998888',
    '$2b$12$Zixrditgg70H/RBU7pXXvOMV9BDYzpSWmGMUdN3n7gF.onH7Y18pS'
);
