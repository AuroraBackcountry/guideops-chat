#!/bin/bash

echo "🔧 Testing Network Access for GuideOps Team Chat"
echo "================================================"

# Get current IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "📍 Local IP: $LOCAL_IP"

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f token-server 2>/dev/null || true
pkill -f react-scripts 2>/dev/null || true

sleep 2

# Start backend server for network access
echo "🚀 Starting backend server..."
STREAM_API_KEY=test_key \
STREAM_API_SECRET=test_secret \
HOST=0.0.0.0 \
PORT=3001 \
node token-server.js &

BACKEND_PID=$!
sleep 3

# Test backend connectivity
echo "🔍 Testing backend connectivity..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend accessible on localhost:3001"
else
    echo "❌ Backend NOT accessible on localhost:3001"
fi

if curl -s http://$LOCAL_IP:3001/health > /dev/null; then
    echo "✅ Backend accessible on network ($LOCAL_IP:3001)"
else
    echo "❌ Backend NOT accessible on network ($LOCAL_IP:3001)"
    echo "   This is likely a firewall issue"
fi

# Start frontend for network access
echo "🌐 Starting frontend for network access..."
REACT_APP_API_URL=http://$LOCAL_IP:3001 \
HOST=0.0.0.0 \
yarn start &

FRONTEND_PID=$!
sleep 5

echo ""
echo "📱 Access URLs:"
echo "   Frontend: http://$LOCAL_IP:3000"
echo "   Backend:  http://$LOCAL_IP:3001"
echo ""
echo "🔧 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📱 Test from your phone:"
echo "   Open browser and go to: http://$LOCAL_IP:3000"

# Wait for user input
read -p "Press Enter to stop servers..."

kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
echo "✅ Servers stopped"
