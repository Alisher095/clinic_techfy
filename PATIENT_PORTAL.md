# Patient Portal Guide

## Overview
A separate, patient-facing portal that allows patients to view and schedule appointments independently from the clinic staff portal.

## Portal Features

### Patient Authentication
- **Patient Login** (`/patient-login`)
  - Email + Password authentication
  - Demo credentials:
    - Email: `patient@example.com`
    - Password: `password123`
  - Links to staff login and patient signup

- **Patient Signup** (`/patient-signup`)
  - Registration form with:
    - First Name & Last Name
    - Email address
    - Phone number
    - Date of Birth
    - Password confirmation
  - Automatic redirect to login after successful registration

### Patient Dashboard (`/patient-dashboard`)
**Main landing page for authenticated patients with:**

#### Stats Overview
- Total appointments count
- Upcoming appointments count
- Completed appointments count

#### Appointment Management
- **View Scheduled Appointments**
  - Card-based layout showing all appointments
  - Each card displays:
    - Appointment type
    - Appointment ID
    - Status badge (Upcoming/Completed/Blocked)
    - Date and time
    - Location/clinic
    - Provider name
    - Insurance status

- **Search & Filter**
  - Search by appointment type or clinic name
  - Filter by status (Upcoming/Completed/Blocked)
  - Real-time filtering

#### Schedule New Appointment
- Modal form with:
  - Appointment type selection (Checkup, Follow-up, Specialist, Lab, Vaccination)
  - Preferred date picker
  - Preferred time picker
  - Clinic selection
  - Reason for visit
  - Additional notes
- Submits appointment request for clinic staff approval

### User Profile
- Header displays patient name with initial avatar
- Logout button in header with navigation to patient login
- Dark mode support

## Navigation Flow

```
Landing Page
    ├─ /patient-login ──────── Sign In
    │   ├─ /patient-dashboard (authenticated) ── View/Schedule Appointments
    │   └─ /patient-signup ─── Create Account
    │
    └─ /login ─────────────────── Staff Portal
```

## File Structure

```
src/pages/
├── PatientLogin.jsx       - Patient login page
├── PatientSignup.jsx      - Patient registration page
└── PatientDashboard.jsx   - Main patient dashboard with appointments

src/
└── store.js               - Added patientLogin() and patientSignup() methods
```

## Key Features

### Role-Based Separation
- **Patient Role**: `role: 'patient'`
- Patients only see their own appointments
- Can't access staff features (alerts, AI orchestrator, payer simulator, etc.)
- Separate, intuitive UI tailored for patients

### Appointment Information
Patients can view:
- Appointment date and time
- Appointment type
- Location/clinic
- Assigned provider
- Insurance verification status

### Appointment Scheduling
Patients can:
- Request new appointments
- Specify preferred dates and times
- Choose appointment type and clinic
- Add reason and notes
- Submit requests for staff approval

### Dark Mode Support
- Full dark mode styling throughout patient portal
- Consistent with staff portal theme

## Authentication

### Patient Login
- Email + password authentication
- Auto-generates patient ID
- Stores patient role as 'patient'

### Patient Signup
- Creates new patient account with:
  - Full name (first + last)
  - Email
  - Phone number
  - Date of birth
  - Secure password

## Demo Access

**Demo Patient Credentials:**
- Email: `patient@example.com`
- Password: `password123`

## Styling

- **Primary Color**: Healthcare Blue (#0F6BFF)
- **Framework**: Tailwind CSS
- **Icons**: Lucide React
- **Responsive**: Mobile-first design with md: and lg: breakpoints

## Future Enhancements

Potential features to add:
- Appointment reminders/notifications
- Prescription history viewing
- Health records access
- Messaging with providers
- Insurance information management
- Billing and payment options
- Appointment cancellation/rescheduling
- Medical history
- Lab results viewing
- Telemedicine support
