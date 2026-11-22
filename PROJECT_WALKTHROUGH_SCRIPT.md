# HealthBridge / Telemed Connect — Project Walkthrough Video Script

## Recommended video length

Aim for **6–8 minutes**. The public-facing screens use the name **Telemed Connect**; the repository/project is HealthBridge. Introduce it once as “HealthBridge, presented in the app as Telemed Connect,” then use “the platform.”

## Before recording

- Start the backend and frontend, then confirm the app opens at `http://localhost:5173` and the backend health endpoint responds at `http://localhost:5001/health`.
- Use prepared demo accounts: one verified patient, one doctor with a completed profile and saved availability, and an admin account if you plan to show the admin panel.
- Make sure the doctor has at least one available time slot and a consultation fee. Check that the selected patient and doctor have realistic demo records.
- Use separate browser profiles (or a normal window and an incognito window) for patient and doctor accounts. The app stores the current login in browser local storage.
- If showing paid booking, verify Razorpay test mode first. Never use a real payment method in the recording. If payment is not ready, skip that step rather than implying it was successful.
- OTP email, Google sign-in, and payment depend on external provider configuration. Use pre-verified accounts for a reliable recording; do not pause the demo to configure credentials.
- Use test data only. Hide personal email addresses, patient details, passwords, API keys, database dashboards, and OAuth settings.
- The appointment completion and history updates in the current local source have not been deployed to the live site. Record from the updated local build unless those changes have been deployed.

## Recording script and screen actions

### 1. Opening — 0:00–0:30

**On screen:** Open the public home page. Keep the browser at a readable zoom level and close unrelated tabs.

**Say:**

> Hello, I’m [your name]. This is HealthBridge, presented in the application as Telemed Connect. It is a full-stack telemedicine platform that brings patients, doctors, and administrators together. In this walkthrough, I’ll show the patient booking journey, the doctor appointment workflow, messaging and prescriptions, and the administration tools.

### 2. Public home page — 0:30–1:00

**On screen:** Briefly show the navigation, hero section, services, and the “Book Consultation” action.

**Say:**

> The public home page introduces the service and directs patients to create an account or sign in. The live doctor directory is available inside the patient portal, where users can search the doctor records maintained by the application.

**Action:** Select **Log In** and sign in using the prepared patient account. Do not show the password on camera.

### 3. Patient portal and finding a doctor — 1:00–2:00

**On screen:** Show the patient dashboard briefly, then select **Find Doctor**. Search by a name or specialty and demonstrate one rating or price filter. Open a doctor profile.

**Say:**

> The patient portal provides navigation to appointments, prescriptions, messages, profile settings, and the doctor directory. In Find Doctor, a patient can search by doctor name or specialty and narrow the results by rating or fee. The profile shows information such as specialization, qualifications, experience, consultation fee, availability, and reviews.

### 4. Booking an appointment — 2:00–2:45

**On screen:** Select **Book Appointment**, choose an available day and time, and show the fee summary. If you have a known-valid demo coupon, apply it.

**Say:**

> The booking form loads the doctor's current availability. The patient selects a day and slot, and can apply a coupon before confirming. For a paid appointment, the configured Razorpay checkout is used; for a zero-fee appointment, the application can submit the booking directly. A successful booking appears as pending until the doctor responds.

**Action:** Complete the booking only if you have tested the demo payment configuration. Otherwise, use an existing pending appointment and continue the walkthrough.

### 5. Doctor appointment workflow — 2:45–4:00

**On screen:** Switch to the doctor browser profile and open **Appointments**. Show the pending appointment. Accept it, add a prepared meeting link, then save. Show the appointment in Upcoming.

**Say:**

> From the doctor portal, the doctor can review incoming requests and accept or reject them. When accepting, the doctor can attach a meeting link so the patient can join the consultation using that external meeting service. The appointment is tracked through its status, and after the consultation the doctor can mark an accepted appointment as completed.

**Action:** If the appointment is already accepted, select **Mark Completed**. Show that it appears under **Past History**.

**Say:**

> The patient and doctor can then refer back to the appointment record. In My Patients, the doctor can open a patient's history to see that patient's appointments, dates, statuses, and recorded amounts.

### 6. Messaging and prescriptions — 4:00–5:00

**On screen:** Open **Messages** as the doctor and select the patient. Show the conversation, then select **Write Rx**. Briefly show the prescription form without entering real patient or medication data. If a prepared demo prescription exists, switch to the patient profile and show it under **Prescriptions**.

**Say:**

> The platform also supports conversations between patients and doctors. Messages are stored by the backend and delivered in real time through Socket.IO. From a doctor–patient conversation, the doctor can open Write Rx, associate the prescription with an appointment, and enter medicines, dosage, frequency, duration, instructions, and an optional follow-up date. Patients can view issued prescriptions in their portal.

**Action:** For a live messaging demonstration, keep the patient account open in the second browser profile and send a short, non-sensitive test message.

### 7. Administration — 5:00–5:45

**On screen:** If an admin demo account is ready, open `/admin`, sign in, and show the dashboard, user list, coupons, and contact messages.

**Say:**

> The admin area provides platform-level tools. An administrator can review user records, manage account access, create and manage discount coupons, and review contact submissions. The dashboard summarizes platform counts.

**Action:** Do not block or delete a real account during the recording. Avoid using the doctor-approval action in this build.

### 8. Technical overview and close — 5:45–6:30

**On screen:** Optionally show the project folders in VS Code: `Frontend/src` and `backend/src`. Keep this brief; do not open environment files.

**Say:**

> The frontend is a React application built with Vite. It communicates with a Node.js and Express API, which uses MongoDB and Mongoose for application data. Authentication uses password hashing and JWTs, with role-specific API middleware for patients, doctors, and admins. Socket.IO supports real-time messaging. The project also has integration points for Google OAuth, email verification, and Razorpay payments; those require the corresponding environment configuration.
>
> That concludes the walkthrough. HealthBridge brings doctor discovery, appointment coordination, patient communication, prescriptions, and administrative tools into one application. Thank you for watching.

## Presenter notes: keep the demo accurate

- The homepage doctor carousel and testimonials are presentation content; use **Find Doctor** to demonstrate the database-backed doctor directory.
- Doctor acceptance attaches an external meeting link. The app does not provide its own video-call engine.
- Some dashboard visuals are placeholders in the current source, including the doctor's sample visit chart and displayed earnings figure. Do not describe those specific values as live analytics.
- The patient prescription list has a **Download PDF** control, but that button is not wired up in the current UI. Demonstrate viewing prescriptions, not downloading them.
- The admin doctor approval screen's action URLs do not currently match the backend routes. Avoid demonstrating approve/reject until that is corrected.
- Google OAuth, OTP delivery, and Razorpay should only be presented as working in the demo environment if you have tested those integrations with the configured local or production credentials.
- Do not describe the application as a substitute for professional medical care. Present it as a software platform for coordinating telemedicine workflows.
