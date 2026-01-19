# HealthCare Dashboard - Insurance Verification Platform

A professional, full-featured healthcare clinic management dashboard built entirely on the frontend with simulated workflows, real-time alerts, and insurance verification management.

## 🎯 Features

### 🔐 Authentication
- **Login Page** - Simulated credential validation with loading states
- **Signup Page** - Create clinic accounts with role selection (Admin/Staff)
- **Session Management** - Frontend-only authentication with role-based access control
- **Demo Mode** - Use any email with any password to login

### 📊 Dashboard
- **Appointment Overview** - View 48-72 hour appointment window
- **Advanced Filtering** - Filter by status, insurance provider, patient name
- **Real-time Status** - Color-coded insurance verification status (Verified/Needs Review/Expired)
- **Quick Actions** - Re-verify insurance, view details, manage appointments
- **Smart Alerts** - Visual warnings for expired insurance and verification failures

### 🏥 Patient Management
- **Patient Profiles** - Detailed patient information and history
- **Insurance Records** - Current and historical insurance information
- **Appointment History** - Complete appointment record with verification status
- **Quick Verification** - One-click insurance re-verification

### 🔍 Insurance Verification Simulator
- **Multi-Payer Support** - Blue Cross, Aetna, Cigna, UnitedHealth, Humana
- **Portal Simulation** - Realistic payer portal login and verification workflow
- **Patient Lookup** - Search by name, DOB, policy ID
- **Status Simulation** - Randomized verification results with coverage details
- **Portal Status Indicators** - Show online/slow/down status

### ⚡ AI Orchestrator
- **Automated Workflows** - Visual representation of verification pipeline
- **Verification Statistics** - Real-time metrics on scanned, verified, and failed appointments
- **Rules Engine** - AI rules for expired insurance, missing copay, high deductible alerts
- **Verification Logs** - Complete audit trail of all verification attempts
- **Success Rate Tracking** - Performance analytics dashboard

### 🔔 Alerts & Notifications
- **Smart Alert Center** - Centralized notification management
- **Alert Types** - Insurance expired, needs review, high risk indicators
- **Severity Levels** - Critical, warning, info alert prioritization
- **Notification Dropdown** - Real-time alerts in top navigation
- **Alert Resolution** - Mark alerts as resolved and track history

### ⚙️ Settings & Configuration
- **Account Information** - View account details and clinic information
- **Notification Preferences** - Email/push/daily report toggles
- **Alert Rules** - Configure which alerts to receive
- **Theme Toggle** - Light/dark mode with persistent storage
- **Role Management** - Role-based access to features

## 🛠️ Technical Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Language**: JavaScript (ES Modules)

## 📁 Project Structure

```
my-app/
├── src/
│   ├── pages/
│   │   ├── Login.jsx                 # Authentication page
│   │   ├── Signup.jsx                # Account creation
│   │   ├── Dashboard.jsx             # Main appointment dashboard
│   │   ├── PatientDetail.jsx         # Patient profile page
│   │   ├── AppointmentDetail.jsx     # Appointment details
│   │   ├── AlertsCenter.jsx          # Alerts management
│   │   ├── PayerSimulator.jsx        # Insurance payer simulation
│   │   ├── AIOrchestrator.jsx        # Workflow automation dashboard
│   │   └── Settings.jsx              # User settings & preferences
│   ├── components/
│   │   ├── Layout.jsx                # Main layout wrapper
│   │   ├── Navigation.jsx            # Sidebar navigation
│   │   ├── NotificationCenter.jsx    # Alert notifications
│   │   ├── ProtectedRoute.jsx        # Route protection
│   │   └── AppointmentModal.jsx      # Modal for appointment details
│   ├── App.jsx                       # Main application component
│   ├── main.jsx                      # React DOM entry point
│   ├── index.css                     # Global styles & Tailwind
│   ├── store.js                      # Zustand state management
│   └── utils.js                      # Utility functions
├── public/                           # Static assets
├── index.html                        # HTML entry point
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind configuration
├── postcss.config.js                 # PostCSS configuration
├── package.json                      # Dependencies
└── README.md                         # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
cd my-app
npm install
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:5174` (or next available port).

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📝 Demo Credentials

**Login**: 
- Email: Any valid email (e.g., `demo@clinic.com`)
- Password: Any password

The application uses simulated authentication, so any credentials will be accepted.

## 🎨 UI/UX Features

### Design Principles
- **Professional SaaS Look** - Clean, modern healthcare UI
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark Mode Support** - Toggle between light and dark themes
- **Color-Coded Status** - Green (Verified), Amber (Review), Red (Expired)
- **Smooth Animations** - Slide-in, fade-in transitions
- **Accessibility** - Keyboard navigation, ARIA labels, high contrast

### Color Palette
- **Primary**: Healthcare Blue (#0F6BFF)
- **Success**: Healthcare Green (#22C55E)
- **Warning**: Healthcare Amber (#F59E0B)
- **Error**: Healthcare Red (#EF4444)
- **Neutral**: Slate grays

## 🔄 Simulated Workflows

### Insurance Verification Flow
1. User views appointment with insurance status
2. Clicks "Re-verify Insurance" button
3. Shows loading animation (2 seconds)
4. Simulates random verification result
5. Updates appointment status and triggers alerts if needed
6. Shows success/failure notification

### Payer Portal Simulation
1. User selects insurance payer
2. Logs in with any credentials
3. Searches for patient
4. Retrieves simulated coverage details
5. Shows plan type, copay, deductible

### Alert Delivery
1. Appointment updated triggers alert creation
2. Alert appears in notification center
3. Shows in alert dropdown with unread count
4. User can resolve or dismiss alerts
5. Resolved alerts maintain history

## 📊 Mock Data

The application generates realistic mock data:
- **Appointments**: 12 simulated appointments spanning 48-72 hours
- **Patients**: 8 unique patient names with IDs
- **Insurance Providers**: 5 major payers (Blue Cross, Aetna, Cigna, UnitedHealth, Humana)
- **Status Distribution**: Mix of Verified, Needs Review, and Expired statuses
- **Dynamic Timestamps**: Last verified times computed from current time

## 🔮 State Management

### Zustand Stores

**Auth Store** (`useAuthStore`)
- `user` - Current logged-in user
- `isAuthenticated` - Auth status
- `login()` - Simulate login
- `signup()` - Create account
- `logout()` - Clear session

**App Store** (`useAppStore`)
- `appointments` - List of all appointments
- `alerts` - Alert notifications
- `theme` - Light/dark mode
- `addAlert()` - Create new alert
- `updateAppointmentStatus()` - Change verification status
- `toggleTheme()` - Switch theme
- `getUnresolvedAlerts()` - Get unresolved alerts

## 🎯 Key Components

### Dashboard Page
- Displays appointments in time range
- Real-time filtering and search
- Statistics cards with quick metrics
- Sortable appointment table
- Modal for appointment details and re-verification

### Alerts Center
- Centralized alert management
- Filter by status (all/unresolved/resolved)
- Severity indicators (critical/warning/info)
- Resolve/dismiss workflow
- Alert count badges

### Payer Simulator
- Multi-payer interface
- Realistic login workflow
- Patient lookup form
- Simulated verification results
- Portal status indicators

### AI Orchestrator
- Workflow visualization
- Success rate metrics
- Rules engine display
- Verification logs
- Performance analytics

## 🎪 Advanced Features

### Real-time Updates
- Alert notifications update instantly
- Appointment status changes propagate immediately
- Toast notifications for actions
- Unread alert badges

### Optimistic UI
- Immediate status updates on actions
- Loading states during operations
- Error handling with retry options
- Smooth transitions

### Accessibility
- Keyboard navigation support
- ARIA labels for interactive elements
- Color contrast compliance
- Screen reader friendly
- Focus indicators

### Performance
- Lightweight bundle (~200KB gzipped)
- Fast initial load
- Smooth animations with CSS
- Efficient re-renders with Zustand

## 🧪 Testing the Application

### Login
1. Go to `/login`
2. Enter any email and password
3. Click "Sign In"
4. Should redirect to dashboard

### Dashboard
1. View list of appointments
2. Use search to filter by patient name
3. Filter by insurance status
4. Select different time ranges

### Re-verify Insurance
1. Click appointment row
2. Click "Re-verify Insurance"
3. Wait for simulated verification (2s)
4. Status should update randomly

### Alerts
1. Perform re-verification that results in "Needs Review" or "Expired"
2. Alert appears in notification dropdown
3. Go to Alerts Center
4. View all alerts with severity levels

### Payer Simulator
1. Select an insurance payer
2. Enter any username/password
3. Login will succeed
4. Fill in patient lookup form
5. Click "Verify Insurance"
6. View simulated coverage details

## 📱 Responsive Design

- **Desktop**: Full layout with sidebar (1200px+)
- **Tablet**: Collapsible sidebar (768px-1199px)
- **Mobile**: Hamburger menu, stacked cards (<768px)

## 🔄 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "zustand": "^4.4.0",
  "lucide-react": "^0.294.0",
  "date-fns": "^2.30.0",
  "clsx": "^2.0.0",
  "tailwindcss": "^3.4.0",
  "vite": "^5.0.0"
}
```

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vite Guide](https://vitejs.dev)

## 🤝 Contributing

This is a demo application for healthcare management. To extend it:

1. Add more appointment types and providers
2. Integrate real API endpoints
3. Implement WebSocket for real-time updates
4. Add patient data persistence
5. Create more sophisticated verification rules
6. Add export/reporting features

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## � Deployment

### Local Development
```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (new terminal)
npm install
npm run dev
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```
- Frontend: http://localhost
- Backend API: http://localhost:8000/api/v1

### Stack Choices
| Component | Choice | Reasoning |
|-----------|--------|-----------|
| Backend | FastAPI + SQLite | Fast development, async support, easy prototyping |
| Database | SQLite | No server setup, portable, sufficient for demo scale |
| Frontend | React + Vite | Modern, fast development, good ecosystem |
| State | Zustand | Lightweight, simple for small app |
| UI | Tailwind CSS | Utility-first, consistent design |
| Real-time | WebSockets | Native FastAPI support, simple implementation |
| Scheduling | APScheduler | Reliable, integrates with async |

### Production Considerations
- Switch to PostgreSQL for concurrency
- Add proper authentication/authorization
- Implement rate limiting (already added with SlowAPI)
- Use Redis for WebSocket scaling
- Add monitoring/logging

## �🙋 Support

For issues or questions about the dashboard:
1. Check the console for errors
2. Verify all dependencies are installed
3. Clear browser cache and reload
4. Check that the development server is running

---

**Built with ❤️ for healthcare professionals**

Version: 1.0.0  
Last Updated: January 2026
