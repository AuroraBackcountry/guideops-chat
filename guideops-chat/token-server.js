const express = require('express');
const { StreamChat } = require('stream-chat');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
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
} catch (error) {
  console.error('❌ Failed to initialize Stream Chat client:', error.message);
  process.exit(1);
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
        email: 'aurora@example.com',
        role: 'admin'
      },
      'ben': { 
        id: 'ben', 
        name: 'Ben', 
        email: 'ben@example.com',
        role: 'user'
      },
      'ben-johns-3swgqqnt': {
        id: 'ben-johns-3swgqqnt',
        name: 'Ben Johns',
        email: 'benwillski@gmail.com',
        role: 'user',
        password: 'test123'
      },
      'user-test-001': {
        id: 'user-test-001',
        name: 'Test User',
        email: 'test@company.com',
        role: 'user',
        password: 'test123'
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

// Authentication endpoint (simplified - use real auth in production)
app.post('/auth', async (req, res) => {
  const { userId, password } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  // In production, validate password against database
  const user = users[userId];
  if (!user) {
    return res.status(401).json({ error: 'Invalid user' });
  }
  
  try {
    // First, create/update user in Stream with proper role
    await serverClient.upsertUser({
      id: userId,
      name: user.name,
      role: user.role, // Assign the user's role (admin or user)
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
    });
    
    // Then generate Stream token (after user exists)
    const streamToken = serverClient.createToken(userId);
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      streamToken,
      streamApiKey: apiKey
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// User registration endpoint
app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Email, name, and password are required' });
  }
  
  // Check if user already exists (by email)
  const existingUserByEmail = Object.values(users).find(user => user.email === email);
  if (existingUserByEmail) {
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
    const userData = {
      id: userId,
      name: name,
      email: email,
      role: 'user', // Default role for new registrations
      password: password // In production, hash this password!
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
  const { channelId, channelType, private: isPrivate, invite_only, preserveName } = req.body;
  
  if (!channelId || !channelType) {
    return res.status(400).json({ error: 'channelId and channelType are required' });
  }
  
  try {
    // Get the channel from server client (has full permissions)
    const channel = serverClient.channel(channelType, channelId);
    await channel.watch(); // Get current state
    
    console.log(`🔄 Updating privacy for ${channelId}`);
    console.log(`📝 Current name: ${channel.data?.name}`);
    console.log(`🔒 Setting private: ${isPrivate}`);
    
    // Update channel with privacy settings - ONLY change privacy, don't touch name
    const updateData = {
      private: isPrivate,
      invite_only: invite_only,
    };
    
    console.log('📝 Privacy-only update (not touching name):', updateData);
    
    console.log('📝 Update data:', updateData);
    
    // Update channel without message (to avoid user_id requirement)
    await channel.update(updateData);
    
    console.log('✅ Privacy updated, name preserved');
    
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

// Fix general channel name endpoint (one-time fix)
app.post('/fix-general-channel-name', async (req, res) => {
  try {
    const channel = serverClient.channel('team', 'general');
    
    // Update channel with proper name and protection flags
    await channel.update({
      name: 'general', // Set proper name for search
      protected: true,
      system_channel: true,
      undeletable: true
    });
    
    console.log('✅ General channel name fixed and protected');
    res.json({ 
      success: true, 
      message: 'General channel now has proper name and is protected' 
    });
  } catch (error) {
    console.error('❌ Error fixing general channel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protect general channel endpoint
app.post('/protect-general-channel', async (req, res) => {
  try {
    const channel = serverClient.channel('team', 'general');
    
    // Update channel with protection flags
    await channel.update({
      protected: true,
      system_channel: true,
      undeletable: true,
      name: 'general' // Ensure name stays as 'general'
    });
    
    console.log('✅ General channel protected');
    res.json({ 
      success: true, 
      message: 'General channel is now protected from editing and deletion' 
    });
  } catch (error) {
    console.error('❌ Error protecting general channel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Archive channel endpoint (admin/owner only) - server-side disabled change
app.post('/admin/archive-channel', async (req, res) => {
  const { channelId, channelType, userId } = req.body;
  
  // Verify permissions (admin or channel owner)
  if (!userId || !users[userId]) {
    return res.status(403).json({ error: 'User authentication required' });
  }
  
  try {
    const channel = serverClient.channel(channelType, channelId);
    await channel.watch();
    
    // Check if user is admin or channel owner
    const isAdmin = users[userId].role === 'admin';
    const isOwner = channel.state.members[userId]?.role === 'moderator';
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Admin or channel owner access required' });
    }
    
    console.log(`📦 Server archiving channel: ${channelId}`);
    
    // Use server client to set disabled (only allowed server-side)
    await channel.update({
      disabled: true
    });
    
    console.log('✅ Channel archived via server');
    res.json({ 
      success: true,
      message: `Channel ${channelId} archived successfully`
    });
  } catch (error) {
    console.error('❌ Error archiving channel:', error);
    res.status(500).json({ error: 'Failed to archive channel' });
  }
});

// Get archived channels endpoint (admin only)
app.get('/admin/archived-channels', async (req, res) => {
  const { userId } = req.query;
  
  // Verify admin permissions
  if (!userId || !users[userId] || users[userId].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    console.log('🔍 Admin querying disabled (archived) channels...');
    
    // Use server client which has full permissions
    const disabledChannels = await serverClient.queryChannels(
      { 
        type: 'team',
        disabled: true
      },
      { updated_at: -1 },
      { limit: 50 }
    );
    
    console.log(`📦 Server found ${disabledChannels.length} disabled channels`);
    
    // Return channel data
    const channelData = disabledChannels.map(channel => ({
      id: channel.id,
      type: channel.type,
      name: channel.data?.name,
      disabled: channel.data?.disabled,
      updated_at: channel.data?.updated_at,
      created_by: channel.data?.created_by?.name,
      member_count: Object.keys(channel.state?.members || {}).length
    }));
    
    res.json({ 
      success: true,
      channels: channelData,
      count: channelData.length
    });
  } catch (error) {
    console.error('❌ Error fetching disabled channels:', error);
    res.status(500).json({ error: 'Failed to fetch disabled channels' });
  }
});

// Unarchive channel endpoint (admin only)
app.post('/admin/unarchive-channel', async (req, res) => {
  const { channelId, channelType, userId } = req.body;
  
  // Verify admin permissions
  if (!userId || !users[userId] || users[userId].role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    console.log(`📤 Admin unarchiving channel: ${channelId}`);
    
    const channel = serverClient.channel(channelType, channelId);
    
    // Update channel to remove archived status
    await channel.update({
      status: 'active',
      archived_at: undefined,
      archived_by: undefined
    }, {
      text: `Channel unarchived by ${users[userId].name || userId}`
    });
    
    console.log('✅ Channel unarchived via backend');
    res.json({ 
      success: true,
      message: `Channel ${channelId} unarchived successfully`
    });
  } catch (error) {
    console.error('❌ Error unarchiving channel:', error);
    res.status(500).json({ error: 'Failed to unarchive channel' });
  }
});

// Channel update protection middleware
const protectGeneralChannel = (req, res, next) => {
  const { channelId, channelType } = req.body;
  
  if (channelType === 'team' && channelId === 'general') {
    return res.status(403).json({ 
      error: 'The general channel is protected and cannot be modified',
      code: 'GENERAL_CHANNEL_PROTECTED'
    });
  }
  
  next();
};

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
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 GuideOps Backend running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://10.0.0.234:${PORT}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
