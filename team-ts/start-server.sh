#!/bin/bash

# Aurora Chat Server Startup Script

echo "🚀 Starting Aurora Chat Backend Server..."

# Check if we're in the right directory
if [ ! -f "token-server.js" ]; then
    echo "❌ token-server.js not found. Make sure you're in the team-ts directory."
    exit 1
fi

# Set environment variables
export STREAM_API_KEY=rge6xccmyrdj
export STREAM_API_SECRET=cknvd7994up7senfy7u2ekuxf3b7hsb72zwdx389w5ersf73z59zqs8rk4gp3h5g
export GOOGLE_CLIENT_ID=201274263827-itj2185555r8lkkd568m2mb6crlgjidq.apps.googleusercontent.com
export PORT=3001
export NODE_ENV=development

echo "📋 Environment configured:"
echo "  - Stream API Key: $STREAM_API_KEY"
echo "  - Port: $PORT"
echo "  - Node Environment: $NODE_ENV"

# Start the server
echo "🔄 Starting server..."
node token-server.js
