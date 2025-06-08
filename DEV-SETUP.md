# KubaNurse Development Guide

## Quick Start

To run the complete KubaNurse application in development mode with both frontend and backend:

```bash
./run-dev.sh
```

This will start:
- **Backend API** on `http://localhost:5000`
- **Frontend App** on `http://localhost:3000`

## Manual Setup (Alternative)

If you prefer to run servers separately:

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (first time only)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
python wsgi.py
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

## Development URLs

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Test Endpoint**: http://localhost:5000/api/test

## Environment Configuration

The frontend is configured to connect to the backend via:
- `REACT_APP_API_URL=http://localhost:5000/api` (in `.env`)

## Testing the Setup

1. Visit http://localhost:3000 for the main application
2. Visit http://localhost:5000/api/test to verify the API is working
3. Check browser console for any connection errors

## Common Issues

### CORS Issues
If you see CORS errors in the browser console, make sure:
- Backend server is running on port 5000
- Frontend is accessing the correct API URL
- Flask-CORS is properly configured

### Port Conflicts
If ports 3000 or 5000 are already in use:
- Backend: Modify the port in `wsgi.py`
- Frontend: React will automatically suggest an alternative port

### Database Issues
If you encounter database errors:
```bash
cd backend
source venv/bin/activate
flask db upgrade  # Apply migrations
```

## Available API Endpoints

- `/api/test` - Health check
- `/api/patients/` - Patient management
- `/api/allergies/` - Allergies and addictions
- `/api/examination/` - Examination data
- `/api/joint-count/` - Joint count assessments
- `/api/das28/` - DAS28 calculations
- `/api/report/` - Report generation

## Development Features

The development setup includes:
- Hot reloading for both frontend and backend
- Debug mode enabled for Flask
- Source maps enabled for React
- CORS configured for cross-origin requests
