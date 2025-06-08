#!/bin/bash

# KubaNurse Development Server Starter
# This script starts both backend and frontend servers for development

echo "🏥 Starting KubaNurse Development Environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the kubanurse root directory"
    exit 1
fi

# Start backend server
echo "🔧 Starting Flask backend server on port 5000..."
cd backend

# Check if virtual environment exists, if not create it
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements if needed
echo "📋 Installing Python dependencies..."
pip install -r requirements.txt

# Start Flask server in background
echo "🚀 Starting Flask API server..."
python wsgi.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
cd ../frontend
echo "🎨 Starting React frontend server on port 3000..."

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Start React development server
echo "🚀 Starting React development server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment is starting up!"
echo "📊 Backend API: http://localhost:5000"
echo "🌐 Frontend App: http://localhost:3000"
echo "🧪 API Test: http://localhost:5000/api/test"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for all background processes
wait
