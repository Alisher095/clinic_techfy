# 🚀 Quick Start Guide

## Installation & Running

### 1. Install Dependencies
```bash
cd my-app
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at **http://localhost:5174**

### 3. Build for Production
```bash
npm run build
```

## 🧪 Testing the Application

### Demo Login Credentials
- **Email**: demo@clinic.com (or any email)
- **Password**: any password

The authentication is simulated, so any credentials will work!

---

## 📋 Feature Walkthrough

### 1️⃣ Dashboard
After logging in, you'll see:
- **Appointment List**: 12 mock appointments for the next 48-72 hours
- **Status Indicators**: Green (Verified), Amber (Needs Review), Red (Expired)
- **Filters**: Search by patient name, filter by status, select time range
- **Quick Actions**: Click any appointment row to view details

**Try This**: 
- Search for "Smith" in the patient name field
- Filter by "Needs Review" status
- Click on any appointment to see details

### 2️⃣ Re-verify Insurance
From the appointment details modal:
1. Click any appointment row
2. Click "Re-verify Insurance" button
3. Watch the 2-second loading animation
4. Status will update to a random result (Verified/Needs Review/Expired)
5. Check alerts if status changed to Needs Review or Expired

**What's Happening**: 
- Simulated API call with loading state
- Random verification result generation
- Automatic alert creation if needed

### 3️⃣ Alerts Center
Access via sidebar menu or notification bell:
1. Click the **Bell Icon** (🔔) at the top right
2. See recent alerts in dropdown
3. Click "View All Alerts" for full center
4. Filter by All/Unresolved/Resolved
5. Mark alerts as resolved or delete them

**Try This**:
- Re-verify an appointment that results in "Expired" status
- Check the notification bell - you'll see a new alert
- Go to Alerts Center and resolve it

### 4️⃣ Payer Verification Simulator
Access via sidebar **"Payer Simulator"**:

1. **Select a Payer**: Click Blue Cross, Aetna, etc.
2. **Login**: Enter any username/password (will accept anything)
3. **Search Patient**: Enter patient name, DOB, and policy ID
4. **Verify**: Click "Verify Insurance" button
5. **View Results**: See coverage details including:
   - Plan type (HMO/PPO/EPO)
   - Copay amount
   - Deductible remaining
   - Verification timestamp

**Try This**:
- Select "Blue Cross"
- Enter any credentials
- Fill in patient search form
- See simulated verification results

### 5️⃣ AI Orchestrator
Access via sidebar **"AI Orchestrator"**:

- **Workflow Visualization**: See the 5-step verification pipeline
- **Statistics**: Total, Verified, Needs Review, Failed counts
- **Success Rate**: Visual progress circle
- **Rules Engine**: View configured AI rules
- **Logs**: See recent verification attempts

**Try This**:
- Click "Run Simulation" button
- Watch the statistics update
- Check verification logs

### 6️⃣ Patient Details
From dashboard, click patient row or sidebar **Patient name**:

- **Patient Information**: Contact and ID details
- **Insurance Record**: Current coverage and status
- **Appointment History**: All appointments for this patient
- **Quick Actions**: Re-verify, schedule, view file

### 7️⃣ Settings
Access via sidebar **"Settings"**:

- **Account Information**: View profile (read-only demo)
- **Notification Preferences**: Toggle email/push/daily report
- **Alert Rules**: Enable/disable specific alert types
- **Theme Toggle**: In sidebar (Moon/Sun icon)
- **Security**: Password change placeholder

## 🎨 Theme Toggle

Click the **Moon** or **Sun** icon in the sidebar to toggle dark mode. Your theme preference is saved!

---

## 🎯 Common Actions

### View Appointment Details
1. Go to Dashboard
2. Click any appointment row
3. Modal opens with full details
4. Click "Re-verify Insurance" to trigger verification

### Create an Alert
1. Go to Dashboard
2. Click any appointment
3. Click "Re-verify Insurance"
4. If result is Expired or Needs Review, alert is created
5. See alert in notification bell or Alerts Center

### Filter Appointments
1. Use the **Search** field for patient name
2. Use **Status** dropdown for insurance status
3. Use **Time Range** dropdown for 48h/72h/7 days
4. Results update instantly

### Verify Insurance via Simulator
1. Go to Payer Simulator
2. Select insurance company
3. Complete the login and verification flow
4. View simulated coverage details

---

## 🛠️ Developer Information

### Project Structure
```
src/
├── pages/           # 8 route pages
├── components/      # 5 reusable components
├── App.jsx          # Router setup
├── store.js         # Zustand state management
├── utils.js         # Helper functions
└── index.css        # Tailwind styles
```

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Lucide Icons** - Icon library

---

## 📱 Responsive Design

- **Desktop (1200px+)**: Full sidebar + content
- **Tablet (768-1199px)**: Collapsible sidebar
- **Mobile (<768px)**: Hamburger menu

Resize your browser to test responsiveness!

---

## 🎪 What's Simulated?

✅ **Simulated (Frontend Only)**:
- Insurance verification results
- Patient data
- Appointment data
- Insurance payer portals
- Alerts and notifications
- User authentication
- All data changes

❌ **NOT in this demo**:
- Real insurance API calls
- Database storage
- Real email/push notifications
- WebSocket connections
- File uploads

---

## 🐛 Troubleshooting

### App won't start?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port already in use?
The app will automatically find another port (5174, 5175, etc.)

### Styles not showing?
- Clear browser cache: Ctrl+Shift+Delete
- Restart dev server

### Authentication not working?
- Click logout (bottom of sidebar)
- Try logging in again with any credentials

---

## 📖 Documentation Files

- **README.md** - Full documentation
- **IMPLEMENTATION.md** - Implementation details
- **QUICKSTART.md** - This file!

---

## 🎉 You're All Set!

Start the dev server and explore the healthcare dashboard. Have fun testing all the features!

```bash
npm run dev
```

**Questions?** Check the README.md for detailed documentation.

---

**Happy Coding! 🚀**
