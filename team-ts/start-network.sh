#!/bin/bash

echo "🚀 Starting GuideOps Team Chat for Network Access"
echo "================================================"

# Kill any existing processes
pkill -f token-server 2>/dev/null || true
pkill -f react-scripts 2>/dev/null || true

echo "📍 Your network IP: 10.0.0.234"
echo ""

# Start backend server
echo "🔧 Starting backend server on port 3001..."
STREAM_API_KEY=rge6xccmyrdj \
STREAM_API_SECRET=cknvd7994up7senfy7u2ekuxf3b7hsb72zwdx389w5ersf73z59zqs8rk4gp3h5g \
HOST=0.0.0.0 \
PORT=3001 \
node token-server.js &

BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Test backend
echo "🔍 Testing backend..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend running on localhost:3001"
else
    echo "❌ Backend not responding on localhost:3001"
fi

# Start frontend
echo ""
echo "🌐 Starting frontend on port 3000..."
REACT_APP_API_URL=http://10.0.0.234:3001 \
REACT_APP_STREAM_KEY=rge6xccmyrdj \
HOST=0.0.0.0 \
PORT=3000 \
yarn start &

FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "🎉 Both servers starting!"
echo ""
echo "📱 Access from your phone:"
echo "   http://10.0.0.234:3000"
echo ""
echo "🖥️ Access locally:"
echo "   http://localhost:3000"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Keep script running
wait
