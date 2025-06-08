# KubaNurse - Rheumatology Assessment System

A comprehensive web-based application for rheumatology assessments, featuring DAS28 calculations, joint examinations, and patient management.

## Features

### 🏥 Patient Management
- **Patient Details Form**: Comprehensive patient information collection with date of birth picker
- **Auto-save functionality**: Real-time data preservation during form completion
- **Responsive design**: Mobile-first approach with tablet and desktop optimization

### 🔬 Clinical Assessments
- **DAS28 Calculator**: Disease Activity Score calculation with visual severity indicators
- **Joint Count Assessment**: Interactive joint examination with tender/swollen joint tracking
- **Examination Records**: Detailed physical examination documentation
- **Voice Commands**: Speech-to-text functionality for hands-free data entry

### 💊 Medical History
- **Allergies & Addictions**: Comprehensive tracking of patient allergies and substance dependencies
- **Dynamic entry system**: Add/remove entries with real-time validation

### 📊 Results & Reporting
- **Visual Progress Indicator**: Step-by-step workflow guidance
- **Severity Classifications**: Color-coded assessment results
- **PDF Report Generation**: Professional medical reports (backend integration)

### 🎨 Modern UI/UX
- **Styled Components**: Modern gradient-based design system
- **Responsive Grid Layouts**: Adaptive layouts for all screen sizes
- **Accessibility Features**: WCAG compliant with keyboard navigation
- **Loading States**: User feedback during data processing

### 🔧 Technical Features
- **React Router**: Multi-step form navigation with URL parameters
- **Custom Hooks**: Reusable auto-save and data management logic
- **Error Handling**: Comprehensive error messages and validation
- **Environment Configuration**: Source map optimization for production

## Project Structure

```
kubanurse/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PatientDetails.js          # Patient information form
│   │   │   ├── AllergiesAddictions.js     # Medical history tracking
│   │   │   ├── Dictation.js               # Voice input interface
│   │   │   ├── JointCount.js              # Joint examination form
│   │   │   ├── Das28Result.js             # DAS28 calculation & results
│   │   │   ├── VoiceCommands.js           # Speech recognition component
│   │   │   └── ProgressIndicator.js       # Workflow navigation
│   │   ├── hooks/
│   │   │   └── useAutoSave.js             # Auto-save functionality
│   │   ├── styles/
│   │   │   └── GlobalStyles.js            # Styled-components design system
│   │   ├── App.js                         # Main application router
│   │   └── index.js                       # Application entry point
│   ├── public/
│   ├── .env                               # Environment configuration
│   └── package.json                       # Frontend dependencies
├── backend/
│   ├── app/
│   │   ├── models.py                      # Database models
│   │   ├── views/                         # API endpoints
│   │   └── config.py                      # Backend configuration
│   ├── migrations/                        # Database migrations
│   └── requirements.txt                   # Backend dependencies
└── README.md
```

## Dependencies

### Backend (`backend/requirements.txt`)
- **Flask**: Web framework for Python
- **Flask-SQLAlchemy**: Database ORM
- **Flask-Migrate**: Database migration management
- **Flask-Cors**: Cross-origin resource sharing
- **psycopg2-binary**: PostgreSQL database adapter
- **ReportLab**: PDF generation for medical reports

### Frontend (`frontend/package.json`)
- **react**: Core React library (v18.x)
- **react-dom**: React DOM renderer
- **react-router-dom**: Client-side routing (v6.x)
- **react-scripts**: Create React App build tools (v5.0.1)
- **axios**: HTTP client for API communication (v1.x)
- **react-datepicker**: Date picker component (v8.3.0)
- **styled-components**: CSS-in-JS styling library (v6.1.18)
- **lucide-react**: Modern icon library (v0.513.0)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL database

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
flask db upgrade
python wsgi.py
```

### Environment Configuration
Create `.env` file in frontend directory:
```
GENERATE_SOURCEMAP=false
```

## Recent Updates

### UI/UX Improvements
- ✅ Modern gradient-based design system
- ✅ Responsive grid layouts for all components
- ✅ Enhanced color palette with semantic color usage
- ✅ Improved form styling with focus states
- ✅ Mobile-optimized responsive design

### Voice Integration
- ✅ Speech-to-text functionality
- ✅ Voice command recognition
- ✅ Audio feedback system
- ✅ Cross-browser compatibility

### Performance Optimizations
- ✅ Auto-save hooks for data persistence
- ✅ Source map optimization
- ✅ Component lazy loading preparation
- ✅ Error boundary implementation

### Accessibility
- ✅ WCAG 2.1 compliance improvements
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ High contrast mode support
