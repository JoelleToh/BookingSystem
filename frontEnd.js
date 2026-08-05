/********************
Facility management
*********************/
function loadFacilities() {
  fetch("http://localhost:8000/GetFacilities")
    .then((res) => res.json())
    .then((data) => {
      const listContainer = document.getElementById("facility-list");
      if (!listContainer) return;

      if (!data || data.length === 0) {
        listContainer.innerHTML = "<p>No facilities available.</p>";
        return;
      }

      let html = "";
      data.forEach((fac) => {
        html += `
          <div>
            <strong>${fac.facility_name} (${fac.facility_code})</strong><br>
            Location: ${fac.location}<br>
            Hours: ${fac.opening_time} - ${fac.closing_time}<br>
            Status:
            <select id="status-${fac.facility_code}">
              <option value="Available" ${fac.status === "Available" ? "selected" : ""}>Available</option>
              <option value="Maintenance" ${fac.status === "Maintenance" ? "selected" : ""}>Maintenance</option>
              <option value="Closed" ${fac.status === "Closed" ? "selected" : ""}>Closed</option>
            </select>
            <button onclick="updateStatus('${fac.facility_code}')">Update</button>
            <hr>
          </div>`;
      });

      listContainer.innerHTML = html;
    })
    .catch((err) => console.error("Fetch failure:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadFacilities();

  const facilityForm = document.getElementById("facility-form") ||
    (document.getElementById("facility-list") ? document.querySelector("form") : null);
  if (!facilityForm) return;

  facilityForm.addEventListener("submit", (event) => {
    event.preventDefault();

    fetch("http://localhost:8000/CreateFacility", {
      method: "POST",
      body: new URLSearchParams(new FormData(event.target)),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Facility could not be added");
        return res.text();
      })
      .then(() => {
        alert("Record Added Successfully!");
        event.target.reset();
        loadFacilities();
      })
      .catch((err) => alert(err.message));
  });
});

function updateStatus(facilityCode) {
  const status = document.getElementById(`status-${facilityCode}`).value;

  fetch("http://localhost:8000/UpdateFacilityStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ facility_code: facilityCode, status: status }),
  })
    .then((res) => res.text())
    .then((message) => {
      alert(message);
      location.reload();
    })
    .catch((err) => console.error("Update error:", err));
}

/********************
Resident management
*********************/


const API_URL = "http://localhost:8000";

function loadResidents() {
  const search = document.getElementById("resident-search").value;

  if (!search.trim()) {
    alert("Please enter a name, email, or unit number to search.");
    return;
  }

  fetch(`${API_URL}/GetResidents?search=${encodeURIComponent(search)}`)
    .then((res) => {
      if (!res.ok) throw new Error("Could not load residents");
      return res.json();
    })
    .then((residents) => {
      const tableBody = document.getElementById("resident-list");
      document.getElementById("resident-results").hidden = false;

      if (residents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No residents found.</td></tr>';
        return;
      }

      tableBody.innerHTML = residents.map((resident) => `
        <tr>
          <td><input id="name-${resident.resident_id}" value="${resident.resident_name}"></td>
          <td><input id="unit-${resident.resident_id}" value="${resident.unit_number || ""}"></td>
          <td><input id="email-${resident.resident_id}" value="${resident.email}"></td>
          <td><input id="contact-${resident.resident_id}" value="${resident.contact_number}"></td>
          <td>
            <select id="status-${resident.resident_id}">
              <option value="Active" ${resident.status === "Active" ? "selected" : ""}>Active</option>
              <option value="Moved Out" ${resident.status === "Moved Out" ? "selected" : ""}>Moved Out</option>
            </select>
          </td>
          <td><button type="button" onclick="updateResident(${resident.resident_id})">Update</button></td>
        </tr>
      `).join("");
    })
    .catch((err) => alert(`${err.message}. Make sure index.js backend server is running.`));
}

document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-button");
  const residentForm = document.getElementById("resident-form");
  if (!searchButton || !residentForm) return;

  searchButton.addEventListener("click", loadResidents);
  residentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    fetch(`${API_URL}/CreateResident`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.target))),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.message.includes("successfully")) throw new Error(data.message);
        alert(data.message);
        event.target.reset();
      })
      .catch((err) => alert(err.message));
  });

});

function updateResident(residentId) {
  const resident = {
    resident_id: residentId,
    resident_name: document.getElementById(`name-${residentId}`).value,
    unit_number: document.getElementById(`unit-${residentId}`).value,
    email: document.getElementById(`email-${residentId}`).value,
    contact_number: document.getElementById(`contact-${residentId}`).value,
    status: document.getElementById(`status-${residentId}`).value,
  };

  fetch(`${API_URL}/UpdateResident`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resident),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
      loadResidents();
    })
    .catch((err) => alert(err.message));
}

/********************
Booking management
*********************/

/********************
Management staff
*********************/
function loadManagementStaff() {
  const tableBody = document.getElementById("management-staff-list");
  const searchInput = document.getElementById("management-staff-search");
  if (!tableBody || !searchInput) return;

    fetch(`${API_URL}/GetManagementStaff?search=${encodeURIComponent(searchInput.value.trim())}`)
    .then((res) => {
      if (!res.ok) throw new Error("Could not load staff records");
      return res.json();
    })
    .then((staff) => {
      if (staff.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No staff records found.</td></tr>';
        return;
      }

      tableBody.innerHTML = staff.map((member) => `
        <tr>
          <td><input id="management-staff-name-${member.management_id}" value="${escapeManagementStaffHtml(member.management_name)}" maxlength="100"></td>
          <td><input type="email" id="management-staff-email-${member.management_id}" value="${escapeManagementStaffHtml(member.email)}" maxlength="100"></td>
          <td><input type="tel" id="management-staff-contact-${member.management_id}" value="${escapeManagementStaffHtml(member.contact_number)}" pattern="[0-9]{8,15}" maxlength="15"></td>
          <td><input type="password" id="management-staff-password-${member.management_id}" placeholder="Leave blank to keep current" maxlength="255"></td>
          <td><button type="button" onclick="updateManagementStaff(${member.management_id})">Update</button></td>
        </tr>
      `).join("");
    })
    .catch((err) => alert(err.message));
}

function escapeManagementStaffHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function updateManagementStaff(managementId) {
  const staff = {
    management_id: managementId,
    management_name: document.getElementById(`management-staff-name-${managementId}`).value.trim(),
    email: document.getElementById(`management-staff-email-${managementId}`).value.trim(),
    contact_number: document.getElementById(`management-staff-contact-${managementId}`).value.trim(),
    password: document.getElementById(`management-staff-password-${managementId}`).value,
  };

  fetch(`${API_URL}/UpdateManagementStaff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(staff),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.message || "Staff could not be updated");
      alert(data.message);
      loadManagementStaff();
    })
    .catch((err) => alert(err.message));
}

document.addEventListener("DOMContentLoaded", () => {
  const staffForm = document.getElementById("management-staff-form");
  const searchButton = document.getElementById("management-staff-search-button");
  if (!staffForm || !searchButton) return;

  loadManagementStaff();
  searchButton.addEventListener("click", loadManagementStaff);
  staffForm.addEventListener("submit", (event) => {
    event.preventDefault();

    fetch(`${API_URL}/CreateManagementStaff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.target))),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Staff could not be added");
        alert(data.message);
        event.target.reset();
        loadManagementStaff();
      })
      .catch((err) => alert(err.message));
  });
});



/********************
Booking frontend
*********************/

/********************
Resident Booking Records Lookup
*********************/

function loadResidentBookings() {
  const loggedInUnit = sessionStorage.getItem("residentUnit");
  const unitInput = document.getElementById("search-unit");
  const contactInput = document.getElementById("search-contact");
  const unit = loggedInUnit || "";
  const contact = "";
  const tableBody = document.getElementById("search-results");
  const messageDiv = document.getElementById("search-message");

  if (unitInput && loggedInUnit) {
    unitInput.value = loggedInUnit;
    unitInput.readOnly = true;
  }
  if (contactInput) contactInput.disabled = true;

  if (!loggedInUnit) {
    if (messageDiv) {
      messageDiv.textContent = "Please log in as a resident first.";
      messageDiv.style.display = "block";
    }
    return;
  }

  if (messageDiv) {
    messageDiv.textContent = "";
    messageDiv.style.display = "none";
  }
  if (tableBody) {
    tableBody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  }

  const query = new URLSearchParams({
    unit_number: unit,
    contact: contact,
  });

  fetch(`${API_URL}/GetResidentBookings?${query.toString()}`)
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        let msg = `Server error: ${res.status}`;
        try {
          const json = JSON.parse(text);
          if (json.message) msg = json.message;
        } catch {
          // Not JSON — keep the status text
        }
        throw new Error(msg);
      }
      return res.json();
    })
    .then((bookings) => {
      if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No booking records found.</td></tr>';
        return;
      }

      tableBody.innerHTML = bookings.map((b) => `
        <tr>
          <td>${escapeHtml(b.booking_code)}</td>
          <td>${escapeHtml(b.unit_number)}</td>
          <td>${escapeHtml(b.facility_name)}</td>
          <td>${escapeHtml(b.booking_date)}</td>
          <td>${escapeHtml(b.start_time)} - ${escapeHtml(b.end_time)}</td>
          <td>${escapeHtml(b.status)}</td>
          <td>
            ${b.status === "Booked" ? `<button type="button" class="btn btn-danger" onclick="cancelResidentBooking('${b.booking_code}', '${b.booking_date}', '${b.start_time}', '${b.end_time}')">Cancel</button>` : "—"}
          </td>
        </tr>
      `).join("");
    })
    .catch((err) => {
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7">Error loading bookings.</td></tr>';
      }
      if (messageDiv) {
        messageDiv.textContent = err.message;
        messageDiv.style.display = "block";
      }
      console.error("GetResidentBookings error:", err);
    });
}

function cancelResidentBooking(bookingCode, bookingDate, startTime, endTime) {
  if (!confirm(`Are you sure you want to cancel booking ${bookingCode}?`)) {
    return;
  }

  // We need the booking_id to update. Fetch fresh data to locate it.
  const unit = sessionStorage.getItem("residentUnit") || "";
  const contact = "";

  const query = new URLSearchParams({
    unit_number: unit,
    contact: contact,
  });

  fetch(`${API_URL}/GetResidentBookings?${query.toString()}`)
    .then((res) => {
      if (!res.ok) throw new Error("Could not reload bookings");
      return res.json();
    })
    .then((bookings) => {
      const target = bookings.find((b) => b.booking_code === bookingCode);
      if (!target) throw new Error("Booking not found");

      const payload = {
        booking_id: target.booking_id,
        booking_date: bookingDate,
        start_time: startTime.slice(0, 5),
        end_time: endTime.slice(0, 5),
        notes: target.notes || "",
        status: "Cancelled",
      };

      return fetch(`${API_URL}/UpdateBooking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    })
    .then((res) => {
      if (!res.ok) throw new Error("Cancellation failed");
      return res.json();
    })
    .then((data) => {
      alert(data.message);
      loadResidentBookings(); // refresh the list
    })
    .catch((err) => {
      alert(err.message);
      console.error("Cancel booking error:", err);
    });
}

/********************
Global Configurations
*********************/
let facilities = [];

//The input processor that turns clock times into simple numbers
function timeToMinutes(value) {
  const [hours, minutes] = String(value).slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

//The output processor that turns numbers back into clock times.
function minutesToTime(value) {
  const hours = String(Math.floor(value / 60)).padStart(2, "0");
  const minutes = String(value % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}
// Use the timeToMinutes() and minutesToTime() above 2 functions to first two functions to build the final list of slots.
function generateFacilityTimeSlots(facility) {
  const opening = timeToMinutes(facility.opening_time);
  const closing = timeToMinutes(facility.closing_time);
  const duration = Number(facility.slot_duration_mins);
  const slots = [];

  for (let start = opening; start + duration <= closing; start += duration) {
    const end = start + duration;
    const startTime = minutesToTime(start);
    const endTime = minutesToTime(end);

    slots.push([
      `${startTime}-${endTime}`,
      `${startTime} - ${endTime}`,
    ]);
  }

  return slots;
}

/********************
Booking Management
*********************/

// Fetch and render booking records based on the selected filters
function loadBookings() {
  const statusInput = document.getElementById("booking-status");
  const facilityInput = document.getElementById("booking-facility");
  const unitInput = document.getElementById("booking-unit");
  const residentNameInput = document.getElementById("booking-resident-name-filter");
  const tableBody = document.getElementById("booking-list");
  if (!statusInput || !facilityInput || !unitInput || !tableBody) return;

  const status = statusInput.value;
  const facility = facilityInput.value.trim();
  const unit = unitInput.value.trim();
  const residentName = residentNameInput ? residentNameInput.value.trim() : "";

  const query = new URLSearchParams({
    status,
    facility,
    unit,
    resident_name: residentName,
  });

  fetch(`${API_URL}/GetBookings?${query.toString()}`)
    .then((res) => {
      if (!res.ok) throw new Error("Could not load bookings");
      return res.json();
    })
    .then((bookings) => {
      if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9">No bookings found.</td></tr>';
        return;
      }

      tableBody.innerHTML = bookings.map((booking) => `
        <tr>
          <td>${booking.booking_code}</td>
          <td>${booking.resident_name}</td>
          <td>${booking.unit_number}</td>
          <td>${booking.facility_name}</td>
          <td><input id="date-${booking.booking_id}" type="date" value="${formatDate(booking.booking_date)}"></td>
          <td>
            <select id="slot-${booking.booking_id}" data-facility-id="${booking.facility_id}" data-booking-date="${formatDate(booking.booking_date)}">
              <option value="${formatTime(booking.start_time)}-${formatTime(booking.end_time)}">
                ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}
              </option>
            </select>
          </td>
          <td>
            <select id="status-${booking.booking_id}">
              <option value="Booked" ${booking.status.toLowerCase() === "booked" ? "selected" : ""}>Booked</option>
              <option value="Cancelled" ${booking.status.toLowerCase() === "cancelled" ? "selected" : ""}>Cancelled</option>
              <option value="Completed" ${booking.status.toLowerCase() === "completed" ? "selected" : ""}>Completed</option>
            </select>
          </td>
          <td><input id="notes-${booking.booking_id}" value="${booking.notes || ""}"></td>
          <td><button type="button" onclick="updateBooking(${booking.booking_id})">Update</button></td>
        </tr>
      `).join("");
      bookings.forEach((booking) => {
        populateBookingTimeSlots(booking);

        const dateInput = document.getElementById(`date-${booking.booking_id}`);
        if (dateInput) {
          dateInput.addEventListener("change", () => {
            populateBookingTimeSlots({
              ...booking,
              booking_date: dateInput.value,
            });
          });
        }
      });
    })
    .catch((err) => alert(`${err.message}. Make sure Backend js is running.`));
}

function loadBookingFacilities() {
  const facilitySelect = document.getElementById("booking-facility-select");
  const timeSlotSelect = document.getElementById("booking-time-slot");
  const dateInput = document.querySelector('#booking-form [name="booking_date"]');
  if (!facilitySelect || !timeSlotSelect || !dateInput) return;

  function renderTimeSlots(bookedSlots = []) {
    if (!facilitySelect.value) {
      timeSlotSelect.innerHTML = '<option value="">Select a facility first</option>';
      return;
    }

    const facility = facilities.find(
      (item) => String(item.facility_id) === facilitySelect.value,
    );
    const slots = generateFacilityTimeSlots(facility);
    const bookedValues = new Set(
      bookedSlots.map((slot) => `${slot.start_time}-${slot.end_time}`),
    );
    const availableSlots = slots.filter(([value]) => !bookedValues.has(value));

    if (availableSlots.length === 0) {
      timeSlotSelect.innerHTML = '<option value="">No slots available</option>';
      return;
    }

    timeSlotSelect.innerHTML = '<option value="">Select a time slot</option>' +
      availableSlots.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  }

  function updateTimeSlots() {
    if (!facilitySelect.value || !dateInput.value) {
      renderTimeSlots();
      return;
    }

    const query = new URLSearchParams({
      facility_id: facilitySelect.value,
      booking_date: dateInput.value,
    });

    fetch(`${API_URL}/GetBookedTimeSlots?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load available time slots");
        return res.json();
      })
      .then(renderTimeSlots)
      .catch((err) => {
        timeSlotSelect.innerHTML = '<option value="">Unable to load time slots</option>';
        alert(err.message);
      });
  }

  facilitySelect.addEventListener("change", updateTimeSlots);
  dateInput.addEventListener("change", updateTimeSlots);

  fetch(`${API_URL}/GetFacilities`)
    .then((res) => {
      if (!res.ok) throw new Error("Could not load facilities");
      return res.json();
    })
    .then((facilityData) => {
      facilities = facilityData;
      const availableFacilities = facilities.filter(
        (facility) => String(facility.status).toLowerCase() === "available",
      );

      if (availableFacilities.length === 0) {
        facilitySelect.innerHTML = '<option value="">No available facilities</option>';
        return;
      }

      facilitySelect.innerHTML = '<option value="">Select a facility</option>' +
        availableFacilities.map((facility) =>
          `<option value="${facility.facility_id}">${facility.facility_name}</option>`,
        ).join("");
      renderTimeSlots();
    })
    .catch((err) => {
      facilitySelect.innerHTML = '<option value="">Unable to load facilities</option>';
      alert(err.message);
    });
}

function populateBookingTimeSlots(booking) {
  const slotSelect = document.getElementById(`slot-${booking.booking_id}`);
  if (!slotSelect) return;

  const currentSlot = `${formatTime(booking.start_time)}-${formatTime(booking.end_time)}`;
  const slots = generateFacilityTimeSlots(booking);
  const query = new URLSearchParams({
    facility_id: booking.facility_id,
    booking_date: formatDate(booking.booking_date),
  });

  fetch(`${API_URL}/GetBookedTimeSlots?${query.toString()}`)
    .then((res) => {
      if (!res.ok) throw new Error("Could not load booking time slots");
      return res.json();
    })
    .then((bookedSlots) => {
      const bookedValues = new Set(
        bookedSlots.map((slot) => `${slot.start_time}-${slot.end_time}`),
      );
      const availableSlots = slots.filter(
        ([value]) => value === currentSlot || !bookedValues.has(value),
      );

      slotSelect.innerHTML = availableSlots
        .map(([value, label]) =>
          `<option value="${value}" ${value === currentSlot ? "selected" : ""}>${label}</option>`,
        )
        .join("");
    })
    .catch((err) => {
      slotSelect.innerHTML = `<option value="${currentSlot}">${currentSlot}</option>`;
      console.error(err);
    });
}

function createBooking(event) {
  event.preventDefault();

  const form = event.target;
  const formData = Object.fromEntries(new FormData(form));

  if (!formData.time_slot) {
    alert("Please select a time slot.");
    return;
  }

  fetch(`${API_URL}/CreateBooking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.message || "Booking could not be added");
      alert(`${data.message}. Booking code: ${data.booking_code}`);
      form.reset();
      loadBookings();
      refreshActiveBookingCalendar();
    })
    .catch((err) => alert(err.message));
}

function setupResidentAutofill() {
  const bookingForm = document.getElementById("booking-form");
  if (!bookingForm) return;

  const unitInput = bookingForm.querySelector('[name="unit_number"]');
  const nameInput = bookingForm.querySelector('[name="resident_name"]');
  const emailInput = bookingForm.querySelector('[name="email"]');
  const contactInput = bookingForm.querySelector('[name="contact_number"]');
  if (!unitInput || !nameInput || !emailInput || !contactInput) return;

  unitInput.addEventListener("change", () => {
    const unit = unitInput.value.trim();
    if (!unit) return;

    fetch(`${API_URL}/GetResidents?search=${encodeURIComponent(unit)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not find resident");
        return res.json();
      })
      .then((residents) => {
        const resident = residents.find((item) => item.unit_number === unit);

        if (!resident) {
          nameInput.value = "";
          emailInput.value = "";
          contactInput.value = "";
          alert("No resident found for this unit number.");
          return;
        }

        nameInput.value = resident.resident_name;
        emailInput.value = resident.email;
        contactInput.value = resident.contact_number;
        nameInput.readOnly = true;
        emailInput.readOnly = true;
        contactInput.readOnly = true;
      })
      .catch((err) => alert(err.message));
  });
}

let activeCalendarDate = new Date();
let activeBookings = [];

function loadActiveBookingCalendar() {
  const section = document.getElementById("active-booking-calendar");
  if (!section) return;

  section.innerHTML = `
    <div class="card panel">
      <div class="actions calendar-toolbar">
        <button id="calendar-previous" class="btn btn-secondary" type="button">&lt;</button>
        <h2 id="calendar-title" class="section-title"></h2>
        <button id="calendar-next" class="btn btn-secondary" type="button">&gt;</button>
      </div>
      <div id="calendar-grid" class="calendar-grid"></div>
      <div id="booking-calendar-detail" class="card panel calendar-detail" hidden></div>
    </div>
  `;
  document.getElementById("calendar-previous").addEventListener("click", () => {
    activeCalendarDate.setMonth(activeCalendarDate.getMonth() - 1);
    renderActiveBookingCalendar();
  });
  document.getElementById("calendar-next").addEventListener("click", () => {
    activeCalendarDate.setMonth(activeCalendarDate.getMonth() + 1);
    renderActiveBookingCalendar();
  });

  refreshActiveBookingCalendar();
}

function refreshActiveBookingCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;

  fetch(`${API_URL}/GetBookings?status=Booked&_=${Date.now()}`, {
    cache: "no-store",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Could not load active bookings");
      return res.json();
    })
    .then((bookings) => {
      activeBookings = bookings;
      renderActiveBookingCalendar();
    })
    .catch((err) => {
      grid.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
    });
}

function renderActiveBookingCalendar() {
  const title = document.getElementById("calendar-title");
  const grid = document.getElementById("calendar-grid");
  if (!title || !grid) return;

  const year = activeCalendarDate.getFullYear();
  const month = activeCalendarDate.getMonth();
  title.textContent = activeCalendarDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const bookingsByDate = {};

  activeBookings.forEach((booking) => {
    const date = String(booking.booking_date).slice(0, 10);
    if (!bookingsByDate[date]) bookingsByDate[date] = [];
    bookingsByDate[date].push(booking);
  });

  const headers = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  grid.innerHTML = headers.map((day) =>
    `<div class="calendar-day-header">${day}</div>`,
  ).join("");

  for (let i = 0; i < firstDay; i += 1) {
    grid.insertAdjacentHTML("beforeend", '<div class="calendar-empty"></div>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${monthPrefix}${String(day).padStart(2, "0")}`;
    const dayBookings = bookingsByDate[dateKey] || [];
    const entries = dayBookings.map((booking) => `
      <button class="calendar-booking" data-booking-id="${booking.booking_id}">
        ${escapeHtml(`${formatTime(booking.start_time)}-${formatTime(booking.end_time)}`)}<br>
        ${escapeHtml(booking.facility_name)}
      </button>
    `).join("");

    grid.insertAdjacentHTML("beforeend", `
      <div class="calendar-day">
        <strong>${day}</strong>${entries}
      </div>
    `);
  }

  grid.querySelectorAll(".calendar-booking").forEach((button) => {
    button.addEventListener("click", () => {
      const booking = activeBookings.find(
        (item) => String(item.booking_id) === button.dataset.bookingId,
      );
      if (booking) showBookingCalendarDetail(booking);
    });
  });
}

function showBookingCalendarDetail(booking) {
  const detail = document.getElementById("booking-calendar-detail");
  if (!detail) return;

  const bookingId = String(booking.booking_id);
  if (!detail.hidden && detail.dataset.bookingId === bookingId) {
    detail.hidden = true;
    detail.innerHTML = "";
    delete detail.dataset.bookingId;
    return;
  }

  detail.hidden = false;
  detail.dataset.bookingId = bookingId;
  detail.innerHTML = `
    <h3>Booking Details</h3>
    <p><strong>Booking Code:</strong> ${escapeHtml(booking.booking_code)}</p>
    <p><strong>Resident:</strong> ${escapeHtml(booking.resident_name)}</p>
    <p><strong>Unit:</strong> ${escapeHtml(booking.unit_number)}</p>
    <p><strong>Facility:</strong> ${escapeHtml(booking.facility_name)}</p>
    <p><strong>Date:</strong> ${escapeHtml(String(booking.booking_date).slice(0, 10))}</p>
    <p><strong>Time:</strong> ${escapeHtml(`${formatTime(booking.start_time)}-${formatTime(booking.end_time)}`)}</p>
    <p><strong>Notes:</strong> ${escapeHtml(booking.notes || "None")}</p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Update the date, time, notes, or status of a booking
function updateBooking(bookingId) {
  const dateInput = document.getElementById(`date-${bookingId}`);
  const slotInput = document.getElementById(`slot-${bookingId}`);
  const notesInput = document.getElementById(`notes-${bookingId}`);
  const statusInput = document.getElementById(`status-${bookingId}`);
  if (!dateInput || !slotInput || !notesInput || !statusInput) return;

  const [startTime, endTime] = slotInput.value.split("-");
  if (!startTime || !endTime) {
    alert("Please select a time slot.");
    return;
  }

  const booking = {
    booking_id: bookingId,
    booking_date: dateInput.value,
    start_time: startTime,
    end_time: endTime,
    notes: notesInput.value,
    status: statusInput.value,
  };

  fetch(`${API_URL}/UpdateBooking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Booking could not be updated");
      return res.json();
    })
    .then((data) => {
      alert(data.message);
      loadBookings();
      refreshActiveBookingCalendar();
    })
    .catch((err) => alert(err.message));
}

function formatDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatTime(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

/********************
Unified DOM Event Listeners
*********************/
document.addEventListener("DOMContentLoaded", () => {
  setupResidentAutofill();

  const residentUnitInput = document.getElementById("unit_number");
  if (residentUnitInput) {
    const residentUnit = sessionStorage.getItem("residentUnit");
    if (!residentUnit) {
      alert("Please log in as a resident first.");
      window.location.href = "index.html";
      return;
    }
    residentUnitInput.value = residentUnit;
    residentUnitInput.dispatchEvent(new Event("change"));
  }

  loadBookings();
  loadBookingFacilities();
  loadActiveBookingCalendar();

  // Set min date on booking date picker to prevent past dates
  const dateInput = document.getElementById("booking_date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) bookingForm.addEventListener("submit", createBooking);

  const filterButton = document.getElementById("filter-bookings");
  if (filterButton) filterButton.addEventListener("click", loadBookings);

  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      loadResidentBookings();
    });
  }
  if (document.getElementById("search-results") && !searchForm) {
    loadResidentBookings();
  }

  // Management Login form listener
  const mgmtLoginForm = document.getElementById("management-login-form");
  if (mgmtLoginForm) {
    mgmtLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(mgmtLoginForm));
      fetch(`${API_URL}/ManagementLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) throw new Error(data.message || "Login failed");
          alert("Management login successful!");
          window.location.href = "management-dashboard.html";
        })
        .catch((err) => alert(err.message));
    });
  }

  // Resident Login form listener
  const residentLoginForm = document.getElementById("resident-login-form");
  if (residentLoginForm) {
    residentLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(residentLoginForm));
      fetch(`${API_URL}/ResidentLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (!ok) throw new Error(data.message || "Login failed");
          sessionStorage.setItem("residentUnit", data.user.unit_number);
          alert(`Welcome back, ${data.user.resident_name}!`);
          window.location.href = "resident-dashboard.html";
        })
        .catch((err) => alert(err.message));
    });
  }
});


/********************
Management dashboard
*********************/
function loadManagementDashboardSummary() {
  const availableFacilities = document.getElementById("dashboard-available-facilities");
  const upcomingBookings = document.getElementById("dashboard-upcoming-bookings");
  const totalBookings = document.getElementById("dashboard-total-bookings");
  const activeResidents = document.getElementById("dashboard-active-residents");
  if (!availableFacilities || !upcomingBookings || !totalBookings || !activeResidents) return;

  fetch(`${API_URL}/GetManagementSummary`)
    .then((res) => {
      if (!res.ok) throw new Error("Could not load dashboard summary");
      return res.json();
    })
    .then((summary) => {
      availableFacilities.textContent = summary.available_facilities;
      upcomingBookings.textContent = summary.upcoming_bookings;
      totalBookings.textContent = summary.total_bookings;
      activeResidents.textContent = summary.active_residents;
    })
    .catch(() => {
      [availableFacilities, upcomingBookings, totalBookings, activeResidents]
        .forEach((element) => { element.textContent = "-"; });
    });
}

function loadManagementDashboardBookings() {
  const tableBody = document.getElementById("dashboard-booking-list");
  if (!tableBody) return;

  fetch(`${API_URL}/GetManagementDashboardBookings`)
    .then((res) => {
      if (!res.ok) throw new Error("Could not load dashboard bookings");
      return res.json();
    })
    .then((bookings) => {
      if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No bookings for the next 7 days.</td></tr>';
        return;
      }

      tableBody.innerHTML = bookings.map((booking) => `
        <tr>
          <td>${escapeHtml(booking.booking_date)}</td>
          <td>${escapeHtml(`${booking.start_time} - ${booking.end_time}`)}</td>
          <td>${escapeHtml(booking.facility_name)}</td>
          <td>${escapeHtml(booking.resident_name)}</td>
          <td>${escapeHtml(booking.unit_number)}</td>
          <td>${escapeHtml(booking.booking_code)}</td>
        </tr>
      `).join("");
    })
    .catch(() => {
      tableBody.innerHTML = '<tr><td colspan="6">Could not load upcoming bookings.</td></tr>';
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadManagementDashboardSummary();
  loadManagementDashboardBookings();
});


// Initiate a standard HTTP request to the official NEA real-time API
 // Initiate a standard HTTP request to the official NEA real-time API
  fetch('https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast')
    .then(response => response.json())
    .then(data => {
      // Navigate the JSON object to locate the general Singapore forecast
      const forecast = data.data.records[0].general;
      const weatherContainer = document.getElementById('nea-weather-content');
      
      // Inject the live data directly into the DOM, targeting .text for the forecast
      weatherContainer.innerHTML = `
        <div class="weather-details">
          <strong>Condition:</strong> ${forecast.forecast.text} <br>
          <strong>Temperature:</strong> ${forecast.temperature.low}°C – ${forecast.temperature.high}°C <br>
          <strong>Humidity:</strong> ${forecast.relativeHumidity.low}% – ${forecast.relativeHumidity.high}%
        </div>
      `;
    })
    .catch(error => {
      // Fallback in case the HTTP request drops or fails
      console.error('Error during HTTP communication:', error);
      document.getElementById('nea-weather-content').innerHTML = '<p class="weather-error">Unable to load weather forecast.</p>';
    });
