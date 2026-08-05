
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

/********************
Facilities Management 
*********************/

// Create new facilities
app.use("/CreateFacility", express.static("management-facilities.html"));

app.post("/CreateFacility", (req, res, next) => {
  console.log("Form submission: " + req.url);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");

  let sqlStatement =
    "insert into facilities (facility_code, facility_name, location, description, opening_time, closing_time, slot_duration_mins) values (?, ?, ?, ?, ?, ?, ?)";

  connection.query(
    sqlStatement,
    [
      "TEMP",
      req.body.facility_name,
      req.body.location,
      req.body.description,
      req.body.opening_time,
      req.body.closing_time,
      req.body.slot_duration_mins,
    ],
    (err, result, fields) => {
      if (err) {
        console.log("SQL Insertion Error: " + err.message);
        return res.end(
          "<script>alert('Database error. Check your inputs.'); window.history.back();</script>",
        );
      }

      let newId = result.insertId;
      let generatedCode = "FAC" + newId;

      sqlStatement =
        "update facilities set facility_code = ? where facility_id = ?";

      connection.query(
        sqlStatement,
        [generatedCode, newId],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.log("SQL Update Error: " + updateErr.message);
            return res.end(
              "<script>alert('Database error during code generation.'); window.history.back();</script>",
            );
          }

          let htmlContent =
            "Requested to Create Facility for: <ul>" +
            "<li>Facility Code: " +
            generatedCode +
            "</li>" +
            "<li>Facility Name: " +
            req.body.facility_name +
            "</li>" +
            "<li>Location: " +
            req.body.location +
            "</li>" +
            "<li>Description: " +
            req.body.description +
            "</li>" +
            "<li>Opening Time: " +
            req.body.opening_time +
            "</li>" +
            "<li>Closing Time: " +
            req.body.closing_time +
            "</li>" +
            "<li>Slot Duration: " +
            req.body.slot_duration_mins +
            " mins</li></ul>";

          console.log("Send Reply: " + htmlContent);
          res.status(200).end();
        },
      );
    },
  );
});

// Fetch facilities that are not closed for viewing
app.get("/GetFacilities", (req, res) => {
  const sql = `
    SELECT
      facility_id,
      facility_code,
      facility_name,
      location,
      opening_time,
      closing_time,
      slot_duration_mins,
      status
    FROM facilities
    WHERE status != 'Closed'
    ORDER BY facility_id;
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.log("SQL Select Error: " + err.message);
      return res.status(500).json([]);
    }

    res.json(results);
  });
});

// Update status of specific facilities
app.post("/UpdateFacilityStatus", (req, res) => {
  const sql = `
        UPDATE facilities
        SET status = ?
        WHERE facility_code = ?
    `;

  connection.query(
    sql,
    [req.body.status, req.body.facility_code],
    (err, result) => {
      if (err) {
        console.log("SQL Update Error: " + err.message);
        return res.status(500).send("Update failed");
      }

      res.send("Status updated successfully");
    },
  );
});

/********************
Resident Management 
*********************/
// Get residents, optionally filtered by name, email, or unit number
app.get("/GetResidents", (req, res) => {
  const search = `%${req.query.search || ""}%`;
  const sql = `
    SELECT resident_id, email, unit_number, resident_name,
           contact_number, status
    FROM residents
    WHERE resident_name LIKE ?
       OR email LIKE ?
       OR unit_number LIKE ?
    ORDER BY resident_name;
  `;

  connection.query(sql, [search, search, search], (err, results) => {
    if (err) {
      console.log("SQL Select Error: " + err.message);
      return res.status(500).json([]);
    }

    res.json(results);
  });
});

// Add a resident
app.post("/CreateResident", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const sql = `
    INSERT INTO residents
      (email, unit_number, resident_name, contact_number, password)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [
      req.body.email,
      req.body.unit_number,
      req.body.resident_name,
      req.body.contact_number,
      hashedPassword,
    ],
    (err, result) => {
      if (err) {
        console.log("SQL Insert Error: " + err.message);
        return res.status(400).json({ message: "Resident already exist" });
      }

      res.status(201).json({
        message: "Resident added successfully",
        residentId: result.insertId,
      });
    },
  );
});

// Update a resident
app.post("/UpdateResident", (req, res) => {
  const sql = `
    UPDATE residents
    SET email = ?, unit_number = ?, resident_name = ?,
        contact_number = ?, status = ?
    WHERE resident_id = ?
  `;

  connection.query(
    sql,
    [
      req.body.email,
      req.body.unit_number,
      req.body.resident_name,
      req.body.contact_number,
      req.body.status,
      req.body.resident_id,
    ],
    (err) => {
      if (err) {
        console.log("SQL Update Error: " + err.message);
        return res.status(400).json({ message: "Resident could not be updated" });
      }

      res.json({ message: "Resident updated successfully" });
    },
  );
});

/********************
Staff Management & Authentication
*********************/

// Management Login
app.post("/ManagementLogin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  const sql = "SELECT management_id, management_name, email, password FROM staff WHERE email = ?";

  connection.query(sql, [email.trim()], async (err, results) => {
    if (err) {
      console.log("SQL Login Error: " + err.message);
      return res.status(500).json({ message: "Database query error" });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid management credentials" });
    }

    const validPassword = await bcrypt.compare(password, results[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid management credentials" });
    }

    const { password: storedPassword, ...user } = results[0];
    res.json({ message: "Login successful", user });
  });
});

// Resident Login
app.post("/ResidentLogin", async (req, res) => {
  const { unit_number, password } = req.body;
  if (!unit_number || !password) {
    return res.status(400).json({ message: "Please enter unit number and password" });
  }

  const sql = "SELECT resident_id, resident_name, unit_number, email, password FROM residents WHERE unit_number = ?";
  connection.query(sql, [unit_number.trim()], async (err, results) => {
    if (err) {
      console.log("SQL Resident Login Error: " + err.message);
      return res.status(500).json({ message: "Database query error" });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid resident credentials" });
    }

    const validPassword = await bcrypt.compare(password, results[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid resident credentials" });
    }

    const { password: storedPassword, ...user } = results[0];
    res.json({ message: "Login successful", user });
  });
});

app.get("/GetManagementStaff", (req, res) => {
  const search = `%${req.query.search || ""}%`;
  const sql = `
    SELECT management_id, management_name, email, contact_number
    FROM staff
    WHERE management_name LIKE ? OR email LIKE ? OR contact_number LIKE ?
    ORDER BY management_name;
  `;

  connection.query(sql, [search, search, search], (err, results) => {
    if (err) {
      console.log("SQL Staff Select Error: " + err.message);
      return res.status(500).json({ message: "Could not load staff records" });
    }
    res.json(results);
  });
});

app.post("/CreateManagementStaff", async (req, res) => {
  const { management_name: managementName, email, contact_number: contactNumber, password } = req.body;
  if (!managementName || !email || !contactNumber || !password) {
    return res.status(400).json({ message: "Please complete all staff fields" });
  }
  if (!/^\d{8,15}$/.test(contactNumber)) {
    return res.status(400).json({ message: "Contact number must contain 8 to 15 digits" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const sql = `
    INSERT INTO staff (management_name, email, contact_number, password)
    VALUES (?, ?, ?, ?)
  `;
  connection.query(sql, [managementName.trim(), email.trim(), contactNumber, hashedPassword], (err, result) => {
    if (err) {
      console.log("SQL Staff Insert Error: " + err.message);
      return res.status(400).json({ message: "Staff email already exists or details are invalid" });
    }
    res.status(201).json({ message: "Staff added successfully", management_id: result.insertId });
  });
});

app.post("/UpdateManagementStaff", async (req, res) => {
  const { management_id: managementId, management_name: managementName, email, contact_number: contactNumber, password } = req.body;
  if (!managementId || !managementName || !email || !contactNumber) {
    return res.status(400).json({ message: "Please provide the staff name and email" });
  }
  if (!/^\d{8,15}$/.test(contactNumber)) {
    return res.status(400).json({ message: "Contact number must contain 8 to 15 digits" });
  }

  const hasNewPassword = Boolean(password);
  const sql = hasNewPassword
    ? "UPDATE staff SET management_name = ?, email = ?, contact_number = ?, password = ? WHERE management_id = ?"
    : "UPDATE staff SET management_name = ?, email = ?, contact_number = ? WHERE management_id = ?";
  const hashedPassword = hasNewPassword
    ? await bcrypt.hash(password, 12)
    : null;
  const values = hasNewPassword
    ? [managementName.trim(), email.trim(), contactNumber, hashedPassword, managementId]
    : [managementName.trim(), email.trim(), contactNumber, managementId];

  connection.query(sql, values, (err) => {
    if (err) {
      console.log("SQL Staff Update Error: " + err.message);
      return res.status(400).json({ message: "Staff email already exists or record could not be updated" });
    }
    res.json({ message: "Staff updated successfully" });
  });
});

/********************
Management dashboard
*********************/
// Get live summary counts for the management dashboard
app.get("/GetManagementSummary", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM bookings) AS total_bookings,
      (SELECT COUNT(*) FROM facilities WHERE status = 'Available') AS available_facilities,
      (SELECT COUNT(*) FROM facilities WHERE status = 'Maintenance') AS maintenance_facilities,
      (SELECT COUNT(*) FROM bookings
       WHERE status = 'Booked'
         AND booking_date >= CURDATE()) AS upcoming_bookings,
      (SELECT COUNT(*) FROM residents WHERE status = 'Active') AS active_residents,
      (SELECT COUNT(*) FROM staff) AS total_staff;
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.log("SQL Management Summary Error: " + err.message);
      return res.status(500).json({ message: "Could not load dashboard summary" });
    }
    res.json(results[0]);
  });
});

// Get booked bookings for today and the following six days
app.get("/GetManagementDashboardBookings", (req, res) => {
  const sql = `
    SELECT b.booking_id, b.booking_code, b.unit_number, b.resident_name,
           f.facility_name,
           DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
           TIME_FORMAT(b.start_time, '%H:%i') AS start_time,
           TIME_FORMAT(b.end_time, '%H:%i') AS end_time
    FROM bookings b
    INNER JOIN facilities f ON b.facility_id = f.facility_id
    WHERE b.status = 'Booked'
      AND b.booking_date >= CURDATE()
      AND b.booking_date < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    ORDER BY b.booking_date, b.start_time;
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.log("SQL Dashboard Booking Error: " + err.message);
      return res.status(500).json({ message: "Could not load dashboard bookings" });
    }
    res.json(results);
  });
});

/*********************************
 Booking Management
 *********************************/

// Get bookings for resident self-service lookup
app.get("/GetResidentBookings", (req, res) => {
  const unit = req.query.unit_number ? `%${req.query.unit_number}%` : null;
  const contact = req.query.contact ? `%${req.query.contact}%` : null;

  if (!unit && !contact) {
    return res.status(400).json({ message: "Please provide unit number or contact detail" });
  }

  let sql = `
    SELECT b.booking_id, b.booking_code, b.unit_number, b.resident_name,
           f.facility_name,
           DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
           TIME_FORMAT(b.start_time, '%H:%i') AS start_time,
           TIME_FORMAT(b.end_time, '%H:%i') AS end_time,
           b.status
    FROM bookings b
    INNER JOIN facilities f ON b.facility_id = f.facility_id
    WHERE 1=1
  `;
  const params = [];

  if (unit) {
    sql += ` AND b.unit_number LIKE ?`;
    params.push(unit);
  }
  if (contact) {
    sql += ` AND (b.email LIKE ? OR b.contact_number LIKE ?)`;
    params.push(contact, contact);
  }
  sql += ` ORDER BY b.booking_date DESC, b.start_time;`;

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.log("SQL Resident Bookings Error: " + err.message);
      return res.status(500).json({ message: "Could not load bookings" });
    }
    res.json(results);
  });
});


// Get bookings filtered by status, facility, or unit number
app.get("/GetBookings", (req, res) => {
  const status = req.query.status || "";
  const facility = `%${req.query.facility || ""}%`;
  const unit = `%${req.query.unit || ""}%`;
  const residentName = `%${req.query.resident_name || ""}%`;

  const sql = `
    SELECT b.booking_id, b.booking_code, b.unit_number, b.resident_name, b.facility_id,
           f.facility_name, f.opening_time, f.closing_time, f.slot_duration_mins,
           DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
           TIME_FORMAT(b.start_time, '%H:%i') AS start_time,
           TIME_FORMAT(b.end_time, '%H:%i') AS end_time,
           b.status, b.notes
    FROM bookings b
    INNER JOIN facilities f ON b.facility_id = f.facility_id
    WHERE (? = '' OR b.status = ?)
      AND f.facility_name LIKE ?
      AND b.unit_number LIKE ?
      AND b.resident_name LIKE ?
    ORDER BY b.booking_date, b.start_time;
  `;

  connection.query(sql, [status, status, facility, unit, residentName], (err, results) => {
    if (err) {
      console.log("SQL Select Error: " + err.message);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

// Get time ranges already used for a facility on a selected date
app.get("/GetBookedTimeSlots", (req, res) => {
  const { facility_id: facilityId, booking_date: bookingDate } = req.query;

  if (!facilityId || !bookingDate) return res.json([]);

  const sql = `
    SELECT TIME_FORMAT(start_time, '%H:%i') AS start_time,
           TIME_FORMAT(end_time, '%H:%i') AS end_time
    FROM bookings
    WHERE facility_id = ?
      AND booking_date = ?
      AND status <> 'Cancelled'
  `;

  connection.query(sql, [facilityId, bookingDate], (err, results) => {
    if (err) {
      console.log("SQL Booked Slots Error: " + err.message);
      return res.status(500).json([]);
    }

    res.json(results);
  });
});

// Create a new booking
app.post("/CreateBooking", (req, res) => {
  const {
    unit_number: unitNumber,
    resident_name: residentName,
    email,
    contact_number: contactNumber,
    facility_id: facilityId,
    booking_date: bookingDate,
    time_slot: timeSlot,
    notes = "",
  } = req.body;

  if (!unitNumber || !residentName || !email || !contactNumber || !facilityId ||
      !bookingDate || !timeSlot) {
    return res.status(400).json({ message: "Please complete all required booking fields" });
  }

  const slotParts = timeSlot.split("-");
  if (slotParts.length !== 2) {
    return res.status(400).json({ message: "Please select a valid time slot" });
  }

  const selectedStartTime = slotParts[0];
  const selectedEndTime = slotParts[1];
  const conflictSql = `
    SELECT booking_id
    FROM bookings
    WHERE facility_id = ?
      AND booking_date = ?
      AND status <> 'Cancelled'
      AND start_time < ?
      AND end_time > ?
    LIMIT 1
  `;

  connection.query(
    conflictSql,
    [facilityId, bookingDate, selectedEndTime, selectedStartTime],
    (conflictErr, conflicts) => {
      if (conflictErr) {
        console.log("SQL Booking Conflict Error: " + conflictErr.message);
        return res.status(500).json({ message: "Could not check time-slot availability" });
      }

      if (conflicts.length > 0) {
        return res.status(409).json({ message: "That time slot is already booked" });
      }

  const sql = `
    INSERT INTO bookings
      (booking_code, unit_number, resident_name, email, contact_number,
       facility_id, booking_date, start_time, end_time, status, notes)
    SELECT 'TEMP', r.unit_number, r.resident_name, r.email, r.contact_number,
           ?, ?, ?, ?, 'Booked', ?
    FROM residents r
    WHERE r.unit_number = ?
      AND r.status = 'Active'
    LIMIT 1
  `;

      connection.query(
        sql,
        [facilityId, bookingDate, selectedStartTime, selectedEndTime, notes,
          unitNumber],
        (err, result) => {
      if (err) {
        console.log("SQL Create Error: " + err.message);
        return res.status(400).json({ message: "Booking could not be added" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          message: "No active resident matches the submitted unit number",
        });
      }

      const newId = result.insertId;
      const generatedCode = `BKG${newId}`;

      connection.query(
        "UPDATE bookings SET booking_code = ? WHERE booking_id = ?",
        [generatedCode, newId],
        (updateErr) => {
          if (updateErr) {
            console.log("SQL Booking Code Error: " + updateErr.message);
            return res.status(400).json({ message: "Booking code could not be generated" });
          }

          res.status(201).json({
            message: "Booking added successfully",
            booking_id: newId,
            booking_code: generatedCode,
          });
        },
      );
        },
      );
    },
  );
});

// Update the date, time, notes, or status of a booking
app.post("/UpdateBooking", (req, res) => {
  const {
    booking_id: bookingId,
    booking_date: bookingDate,
    start_time: startTime,
    end_time: endTime,
    notes = "",
    status,
  } = req.body;

  if (!bookingId || !bookingDate || !startTime || !endTime || !status) {
    return res.status(400).json({ message: "Missing booking details" });
  }

  const getFacilitySql = "SELECT facility_id FROM bookings WHERE booking_id = ?";

  connection.query(getFacilitySql, [bookingId], (facilityErr, bookingRows) => {
    if (facilityErr) {
      console.log("SQL Booking Lookup Error: " + facilityErr.message);
      return res.status(500).json({ message: "Could not verify booking" });
    }

    if (bookingRows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const facilityId = bookingRows[0].facility_id;
    const conflictSql = `
      SELECT booking_id
      FROM bookings
      WHERE facility_id = ?
        AND booking_date = ?
        AND status <> 'Cancelled'
        AND booking_id <> ?
        AND start_time < ?
        AND end_time > ?
      LIMIT 1
    `;

    const checkConflict = status === "Cancelled"
      ? Promise.resolve([])
      : new Promise((resolve, reject) => {
          connection.query(
            conflictSql,
            [facilityId, bookingDate, bookingId, endTime, startTime],
            (conflictErr, conflicts) => {
              if (conflictErr) reject(conflictErr);
              else resolve(conflicts);
            },
          );
        });

    checkConflict
      .then((conflicts) => {
        if (conflicts.length > 0) {
          return res.status(409).json({ message: "That time slot is already booked" });
        }

        const sql = `
          UPDATE bookings
          SET booking_date = ?, start_time = ?, end_time = ?,
              notes = ?, status = ?
          WHERE booking_id = ?
        `;

        connection.query(
          sql,
          [bookingDate, startTime, endTime, notes, status, bookingId],
          (err) => {
            if (err) {
              console.log("SQL Update Error: " + err.message);
              return res.status(400).json({ message: "Booking could not be updated" });
            }

            res.json({ message: "Booking updated successfully" });
          },
        );
      })
      .catch((err) => {
        console.log("SQL Booking Conflict Error: " + err.message);
        res.status(500).json({ message: "Could not check time-slot availability" });
      });
  });
});


/*********************************
 * Execution Entry Point
 *********************************/
app.listen(8000, (err) => {
  if (err) {
    console.error("Server failed to start:", err);
    return;
  }
  console.log("Server is running successfully on port 8000");
});

