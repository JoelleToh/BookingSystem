# Community Facility Booking System Database Documentation
[[Changes to DB]]
[[Notes DB]]
## Database Overview

The **Community Facility Booking System** database stores information for managing residential facilities and their bookings.

The database consists of **four tables**:

| Table        | Purpose                                      |
| ------------ | -------------------------------------------- |
| `facilities` | Stores all facilities available for booking. |
| `residents`  | Stores resident account information.         |
| `bookings`   | Stores facility booking records.             |
| `staff`      | Stores management administrator accounts.    |

# Database Structure

```
Residents
    (No direct FK)

Facilities
    │
    │ facility_id
    ▼
Bookings

Management
    (Independent)
```

Only the **Bookings** table has a foreign key relationship with **Facilities**.

---

# Table Documentation

## 1. Facilities

Stores information about all bookable facilities.

### Structure

| Column             | Data Type    | Constraints                    | Description               |
| ------------------ | ------------ | ------------------------------ | ------------------------- |
| facility_id        | INT          | Primary Key, Auto Increment    | Unique facility ID        |
| facility_code      | VARCHAR(10)  | NOT NULL, UNIQUE               | Short facility code       |
| facility_name      | VARCHAR(100) | NOT NULL                       | Name of facility          |
| location           | VARCHAR(150) | NOT NULL                       | Facility location         |
| description        | TEXT         | Nullable                       | Additional information    |
| opening_time       | TIME         | NOT NULL, Default 07:00        | Daily opening time        |
| closing_time       | TIME         | NOT NULL, Default 22:00        | Daily closing time        |
| slot_duration_mins | INT          | NOT NULL, Default 60           | Booking duration per slot |
| status             | ENUM         | Available, Maintenance, Closed | Current facility status   |
| created_at         | TIMESTAMP    | Default CURRENT_TIMESTAMP      | Record creation timestamp |

### Constraints

- Primary Key:
    - `facility_id`
- Unique:
    - `facility_code`
- Check Constraint:
    - `slot_duration_mins > 0`

---

## 2. Residents

Stores resident account information.

### Structure

| Column         | Data Type    | Constraints                 | Description             |
| -------------- | ------------ | --------------------------- | ----------------------- |
| resident_id    | INT          | Primary Key, Auto Increment | Resident ID             |
| email          | VARCHAR(100) | NOT NULL, UNIQUE            | Resident email          |
| unit_number    | VARCHAR(20)  | UNIQUE                      | Residential unit number |
| resident_name  | VARCHAR(100) | NOT NULL                    | Full name               |
| contact_number | VARCHAR(20)  | NOT NULL                    | Contact number          |
| password       | VARCHAR(255) | NOT NULL                    | Encrypted password      |
| status         | ENUM         | Active, Moved Out           | Resident status         |
| created_at     | TIMESTAMP    | Default CURRENT_TIMESTAMP   | Account creation date   |

### Constraints

- Primary Key:
    - `resident_id`
- Unique:
    - `email`
    - `unit_number`
- Check Constraints:
    - Email must follow basic email format.
    - Contact number must contain **8–15 digits**.

---

## 3. Bookings

Stores all facility booking records.

### Structure

| Column         | Data Type    | Constraints                  | Description              |
| -------------- | ------------ | ---------------------------- | ------------------------ |
| booking_id     | INT          | Primary Key, Auto Increment  | Booking ID               |
| booking_code   | VARCHAR(12)  | NOT NULL, UNIQUE             | Unique booking reference |
| unit_number    | VARCHAR(20)  | NOT NULL                     | Resident unit number     |
| resident_name  | VARCHAR(100) | NOT NULL                     | Resident name            |
| email          | VARCHAR(100) | NOT NULL                     | Resident email           |
| contact_number | VARCHAR(20)  | NOT NULL                     | Contact number           |
| facility_id    | INT          | Foreign Key                  | References Facilities    |
| booking_date   | DATE         | NOT NULL                     | Booking date             |
| start_time     | TIME         | NOT NULL                     | Booking start time       |
| end_time       | TIME         | NOT NULL                     | Booking end time         |
| status         | ENUM         | Booked, Cancelled, Completed | Booking status           |
| notes          | VARCHAR(255) | Nullable                     | Additional remarks       |
| created_at     | TIMESTAMP    | Default CURRENT_TIMESTAMP    | Record creation time     |
| updated_at     | TIMESTAMP    | Auto Update                  | Last modified time       |

### Foreign Key

```
facility_id
    ↓
facilities.facility_id
```

### Foreign Key Behaviour

| Operation | Action   |
| --------- | -------- |
| ON UPDATE | CASCADE  |
| ON DELETE | RESTRICT |

---

## 4. Staff

Stores administrator accounts used to manage the system.

### Structure

|Column|Data Type|Constraints|Description|
|---|---|---|---|
|management_id|INT|Primary Key, Auto Increment|Administrator ID|
|management_name|VARCHAR(100)|NOT NULL|Administrator name|
|email|VARCHAR(100)|NOT NULL, UNIQUE|Login email|
|password|VARCHAR(255)|NOT NULL|Encrypted password|
|created_at|TIMESTAMP|Default CURRENT_TIMESTAMP|Account creation time|

### Constraints

- Primary Key:
    - `management_id`
- Unique:
    - `email`
- Check Constraint:
    - Email must follow a basic email format.

---

# Database Relationships

|Parent Table|Child Table|Relationship|
|---|---|---|
|Facilities|Bookings|One-to-Many (1:N)|

A single facility can have multiple booking records, while each booking is associated with exactly one facility.

---

# Enumerated Values

## Facilities Status

|Value|Meaning|
|---|---|
|Available|Facility can be booked|
|Maintenance|Facility temporarily unavailable|
|Closed|Facility permanently or temporarily closed|

---

## Resident Status

|Value|Meaning|
|---|---|
|Active|Resident can use the system|
|Moved Out|Resident account is inactive|

---

## Booking Status

| Value     | Meaning                    |
| --------- | -------------------------- |
| Booked    | Booking has been confirmed |
| Cancelled | Booking has been cancelled |
| Completed | Booking has been completed |

---

# Data Validation

|Table|Validation|
|---|---|
|Facilities|Slot duration must be greater than 0 minutes|
|Residents|Email format validation|
|Residents|Contact number must contain 8–15 digits|
|Management|Email format validation|
|Bookings|Facility ID must exist in the Facilities table|

---

# Design Notes

- All primary keys use **AUTO_INCREMENT** for automatic record identification.
- Timestamps are automatically generated using `CURRENT_TIMESTAMP`.
- Passwords are designed to store hashed values using `VARCHAR(255)` for future optimization.
- Booking records store resident details (unit number, name, email, and contact number) as a snapshot, preserving historical booking information.
- Bookings are associated with the resident's assigned **unit number**. After authentication, the application retrieves the resident's current unit number to display the booking history for that unit.
- The database enforces a foreign key relationship between `bookings` and `facilities`, ensuring every booking references a valid facility while preventing deletion of facilities with existing bookings.
