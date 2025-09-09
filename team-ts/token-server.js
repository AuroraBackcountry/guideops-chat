const express = require('express');
const { StreamChat } = require('stream-chat');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();

// Enhanced CORS configuration for remote access
const corsOptions = {
  origin: [
    'http://localhost:3000',           // Local development
    'http://10.0.0.234:3000',         // Network access
    /^http:\/\/192\.168\.\d+\.\d+:3000$/, // Common local network ranges
    /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,  // Your current network range
    /^http:\/\/172\.16\.\d+\.\d+:3000$/   // Docker/private networks
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Environment variables with validation
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;

// Validate required environment variables
if (!apiKey) {
  console.error('❌ STREAM_API_KEY environment variable is required');
  console.log('💡 Set it with: export STREAM_API_KEY=your_api_key');
  process.exit(1);
}

if (!apiSecret) {
  console.error('❌ STREAM_API_SECRET environment variable is required');
  console.log('💡 Set it with: export STREAM_API_SECRET=your_api_secret');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log(`📡 Stream API Key: ${apiKey}`);
console.log(`🔐 Google OAuth: ${googleClientId ? 'Configured' : 'Not configured'}`);

// Initialize Stream Chat client with error handling
let serverClient;
try {
  serverClient = StreamChat.getInstance(apiKey, apiSecret);
  console.log('✅ Stream Chat client initialized');
  
  // Initialize bot user
  initializeBotUser().catch(err => console.error('Bot initialization error:', err));
} catch (error) {
  console.error('❌ Failed to initialize Stream Chat client:', error.message);
  process.exit(1);
}

// Initialize bot user in Stream Chat
async function initializeBotUser() {
  try {
    console.log('🤖 Initializing bot user...');
    const botUser = {
      id: 'aurora-ai-assistant',
      name: '🤖 Aurora AI Assistant',
      role: 'user', // Use 'user' role instead of 'bot' for compatibility
      image: 'https://api.dicebear.com/7.x/bottts/svg?seed=aurora-ai'
    };

    await serverClient.upsertUser(botUser);
    console.log('✅ Bot user initialized:', botUser.name);
    
    // Also create a demo messaging channel for testing
    try {
      const generalChannel = serverClient.channel('team', 'general');
      await generalChannel.addMembers([botUser.id]);
      console.log('✅ Bot added to general channel');
    } catch (channelError) {
      console.log('⚠️ Could not add bot to general channel:', channelError.message);
    }
  } catch (error) {
    console.error('❌ Failed to initialize bot user:', error);
    console.error('Error details:', error.message);
  }
}

// Google OAuth setup with error handling
let googleClient;
if (googleClientId) {
  try {
    googleClient = new OAuth2Client(googleClientId);
    console.log('✅ Google OAuth client initialized');
  } catch (error) {
    console.error('⚠️ Google OAuth setup failed:', error.message);
    console.log('💡 Google login will be disabled');
  }
} else {
  console.log('⚠️ Google OAuth not configured (GOOGLE_CLIENT_ID missing)');
}

// Simple file-based user database (replace with real database in production)
const USERS_FILE = path.join(__dirname, 'users.json');

// Load users from file or create default users
let users = {};
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    console.log(`📊 Loaded ${Object.keys(users).length} users from database`);
  } else {
    // Default users if no file exists
    users = {
      'aurora4': { 
        id: 'aurora4', 
        name: 'Aurora', 
        email: 'admin@aurorabackcountry.com',
        role: 'admin',
        isDemo: true
      }
    };
    saveUsers();
  }
} catch (error) {
  console.error('Error loading users:', error);
  users = {};
}

// Save users to file
function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log(`💾 Saved ${Object.keys(users).length} users to database`);
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// Authentication endpoint removed - using the email-supporting version below

// User registration endpoint
app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Email, name, and password are required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  
  // Password strength validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  // Check if user already exists (by email)
  const existingUser = Object.values(users).find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists. Please use a different email or try logging in.' });
  }
  
    // Also check if email is being used as a user ID
  if (users[email]) {
    return res.status(409).json({ error: 'An account with this email already exists. Please try logging in.' });
  }
  
  // Check in Stream as well for extra safety
  try {
    const streamUsers = await serverClient.queryUsers({ email: email });
    if (streamUsers.users.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists in the system.' });
    }
  } catch (streamError) {
    // If Stream query fails, continue (might be a query limitation)
    console.log('Stream email check failed, continuing with registration');
  }
  
  try {
    // Generate secure UUID-based user ID with first name prefix
    const firstName = name.split(' ')[0].toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters, keep only alphanumeric
      .substring(0, 15); // Limit first name length
    
    const uuid = require('crypto').randomUUID();
    const shortUuid = uuid.replace(/-/g, '').substring(0, 12); // Remove dashes and shorten for readability
    const userId = `${firstName}_${shortUuid}`;
    
    console.log(`🆔 Generated secure user ID: ${userId} for ${name}`);
    
    // Create user data
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    
    const userData = {
      id: userId,
      name: name,
      email: email,
      role: 'user', // Default role for new registrations
      password: hashedPassword, // Securely hashed password
      isDemo: false
    };
    
    // Add to our user database and save to file
    users[userId] = userData;
    saveUsers();
    
    // Create user in Stream
    await serverClient.upsertUser({
      id: userId,
      name: userData.name,
      role: userData.role,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      // Custom fields
      email: userData.email
    });
    
    // Add user to general channel automatically
    try {
      await serverClient.channel('team', 'general').addMembers([userId]);
      console.log(`✅ Added ${userId} to general channel`);
    } catch (channelError) {
      console.log(`⚠️  Could not add ${userId} to general channel:`, channelError.message);
      // Don't fail registration if channel add fails
    }
    
    // Generate Stream token
    const streamToken = serverClient.createToken(userId);
    
    res.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      },
      streamToken,
      streamApiKey: apiKey
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Update auth endpoint to support email login
app.post('/auth', async (req, res) => {
  const { userId, password } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId or email is required' });
  }
  
  console.log(`🔍 Login attempt for: ${userId}`);
  console.log(`📊 Available users:`, Object.keys(users));
  
  // Find user by ID or email
  let user = users[userId]; // Try by ID first
  console.log(`🔑 Found by ID:`, user ? 'Yes' : 'No');
  
  if (!user) {
    // Try to find by email
    user = Object.values(users).find(u => u.email === userId);
    console.log(`📧 Found by email:`, user ? `Yes (${user.id})` : 'No');
  }
  
  if (!user) {
    console.log(`❌ User not found for: ${userId}`);
    return res.status(401).json({ error: 'Invalid user' });
  }
  
  console.log(`✅ User found:`, user.id, user.name);
  
  // In production, validate password hash
  // For demo, we skip password validation
  
  try {
    // Create/update user in Stream with proper role
    await serverClient.upsertUser({
      id: user.id,
      name: user.name,
      role: user.role,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      email: user.email
    });
    
    // Add user to general channel automatically
    try {
      await serverClient.channel('team', 'general').addMembers([user.id]);
      console.log(`✅ Added ${user.id} to general channel`);
    } catch (channelError) {
      console.log(`⚠️  Could not add ${user.id} to general channel:`, channelError.message);
      // Don't fail login if channel add fails
    }
    
    // Generate Stream token
    const streamToken = serverClient.createToken(user.id);
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      streamToken,
      streamApiKey: apiKey
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Manual bot initialization endpoint for testing
app.post('/init-bot', async (req, res) => {
  try {
    console.log('🤖 Manual bot initialization requested...');
    const botUser = {
      id: 'aurora-ai-assistant',
      name: '🤖 Aurora AI Assistant',
      role: 'user',
      image: 'https://api.dicebear.com/7.x/bottts/svg?seed=aurora-ai'
    };

    await serverClient.upsertUser(botUser);
    console.log('✅ Bot user created manually:', botUser.name);
    
    res.json({ success: true, message: 'Bot user initialized', bot: botUser });
  } catch (error) {
    console.error('❌ Manual bot initialization failed:', error);
    res.status(500).json({ error: 'Bot initialization failed', details: error.message });
  }
});

// Google OAuth authentication endpoint
app.post('/auth/google', async (req, res) => {
  const { credential } = req.body;
  
  if (!credential) {
    return res.status(400).json({ error: 'Google credential is required' });
  }
  
  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    
    // Extract user information from Google
    const googleUserId = payload.sub;
    const email = payload.email;
    const name = payload.name || email;
    const picture = payload.picture;
    
    // Generate human-readable user ID based on name
    const nameSlug = (name || email.split('@')[0]).toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .substring(0, 20); // Limit length
    
    const randomCode = Math.random().toString(36).substr(2, 8);
    const userId = `${nameSlug}-${randomCode}`;
    
    // Create user data
    const userData = {
      id: userId,
      name: name,
      email: email,
      role: 'user', // Default role for Google OAuth users
      google_id: googleUserId,
      avatar: picture
    };
    
    // Create/update user in Stream
    await serverClient.upsertUser({
      id: userId,
      name: userData.name,
      role: userData.role,
      image: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      // Custom fields
      email: userData.email,
      google_id: googleUserId
    });
    
    // Generate Stream token
    const streamToken = serverClient.createToken(userId);
    
    res.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      },
      streamToken,
      streamApiKey: apiKey
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Assign channel moderator endpoint (for channel creators)
app.post('/assign-channel-moderator', async (req, res) => {
  const { channelId, channelType, userId } = req.body;
  
  if (!channelId || !channelType || !userId) {
    return res.status(400).json({ error: 'channelId, channelType, and userId are required' });
  }
  
  try {
    // Get the channel from server client (has full permissions)
    const channel = serverClient.channel(channelType, channelId);
    
    // Add user as channel moderator
    await channel.addModerators([userId]);
    
    res.json({ 
      success: true, 
      message: `User ${userId} is now a channel moderator`,
      userId,
      role: 'channel_moderator'
    });
  } catch (error) {
    console.error('Failed to assign channel moderator:', error);
    res.status(500).json({ error: 'Failed to assign channel moderator role' });
  }
});

// Update channel privacy endpoint (admin only)
app.post('/update-channel-privacy', async (req, res) => {
  const { channelId, channelType, private: isPrivate, invite_only } = req.body;
  
  if (!channelId || !channelType) {
    return res.status(400).json({ error: 'channelId and channelType are required' });
  }
  
  try {
    // Get the channel from server client (has full permissions)
    const channel = serverClient.channel(channelType, channelId);
    
    // Update channel with privacy settings
    const updateData = {
      private: isPrivate,
      invite_only: invite_only,
    };
    
    // Update channel without message (to avoid user_id requirement)
    await channel.update(updateData);
    
    res.json({ 
      success: true, 
      message: `Channel is now ${isPrivate ? 'private' : 'public'}`,
      channelData: updateData
    });
  } catch (error) {
    console.error('Failed to update channel privacy:', error);
    res.status(500).json({ error: 'Failed to update channel privacy' });
  }
});

// Debug endpoint to see current users
app.get('/debug-users', (req, res) => {
  res.json({ 
    users: Object.keys(users).map(id => ({
      id,
      name: users[id].name,
      email: users[id].email,
      role: users[id].role
    })),
    total: Object.keys(users).length
  });
});

// Quick fix: Add ben to general channel
app.post('/add-ben-to-general', async (req, res) => {
  try {
    const channel = serverClient.channel('team', 'general');
    await channel.addMembers(['ben']);
    res.json({ success: true, message: 'Ben added to general channel' });
  } catch (error) {
    console.error('Error adding ben to general:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin role management endpoints
app.post('/admin/update-user-role', async (req, res) => {
  const { userId, newRole, adminUserId } = req.body;
  
  // Verify admin permissions
  if (!adminUserId || !users[adminUserId] || users[adminUserId].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  if (!userId || !newRole) {
    return res.status(400).json({ error: 'userId and newRole are required' });
  }
  
  try {
    // Update in our local database
    if (users[userId]) {
      users[userId].role = newRole;
      saveUsers();
    }
    
    // Update in Stream
    await serverClient.updateUser({
      id: userId,
      role: newRole
    });
    
    console.log(`🔄 Admin ${adminUserId} updated ${userId} role to ${newRole}`);
    res.json({ 
      success: true, 
      message: `Updated ${userId} role to ${newRole}`,
      user: users[userId] 
    });
  } catch (error) {
    console.error('Failed to update user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user endpoint (admin only)
app.delete('/admin/delete-user', async (req, res) => {
  const { userId, adminUserId } = req.body;
  
  // Verify admin permissions
  if (!adminUserId || !users[adminUserId] || users[adminUserId].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  // Prevent deleting master admin
  if (userId === 'aurora4') {
    return res.status(403).json({ error: 'Cannot delete master admin account' });
  }
  
  try {
    // Delete from our local database
    delete users[userId];
    saveUsers();
    
    // Delete from Stream (this will remove user from all channels)
    await serverClient.deleteUser(userId, { mark_messages_deleted: true });
    
    console.log(`🗑️ Admin ${adminUserId} deleted user ${userId}`);
    res.json({ 
      success: true, 
      message: `Deleted user ${userId}`,
      remainingUsers: Object.keys(users).length
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// List all users (admin only)
app.get('/admin/users', (req, res) => {
  const { adminUserId } = req.query;
  
  // Verify admin permissions
  if (!adminUserId || !users[adminUserId] || users[adminUserId].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  res.json({ 
    users: Object.keys(users).map(id => ({
      id,
      name: users[id].name,
      email: users[id].email,
      role: users[id].role,
      hasPassword: !!users[id].password
    })),
    total: Object.keys(users).length
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 GuideOps Backend running on http://${HOST}:${PORT}`);
  console.log(`🌐 Network access: http://10.0.0.234:${PORT}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
