-- ========================================================
-- 1. CREATE THE FACILITIES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS facilities (
    facility_id INT AUTO_INCREMENT PRIMARY KEY,
    facility_code VARCHAR(10) NOT NULL UNIQUE,
    facility_name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(150) NOT NULL,
    description TEXT,
    opening_time TIME NOT NULL DEFAULT '07:00:00',
    closing_time TIME NOT NULL DEFAULT '22:00:00',
    slot_duration_mins INT NOT NULL DEFAULT 60,
    status ENUM('Available', 'Maintenance', 'Closed') NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (slot_duration_mins > 0)
);
-- ========================================================
-- 2. CREATE THE RESIDENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS residents (
    resident_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    unit_number VARCHAR(20) UNIQUE,
    resident_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('Active', 'Moved Out') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (email LIKE '%@%.%'),
    CHECK (contact_number REGEXP '^[0-9]{8,15}$')
);
-- ========================================================
-- 3. CREATE THE BOOKING TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(12) NOT NULL UNIQUE,
  unit_number VARCHAR(20) NOT NULL,
  resident_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  facility_id INT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('Booked', 'Cancelled', 'Completed') NOT NULL DEFAULT 'booked',
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_facility
    FOREIGN KEY (facility_id)
    REFERENCES facilities (facility_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);
-- ========================================================
-- 4. CREATE THE STAFF TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS staff (
    management_id INT AUTO_INCREMENT PRIMARY KEY,
    management_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contact_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (email LIKE '%@%.%')
);