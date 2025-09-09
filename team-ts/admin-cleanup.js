#!/usr/bin/env node

/**
 * GuideOps Admin Cleanup Script
 * 
 * This script helps you clean up demo users and manage your production user system.
 * Run with: node admin-cleanup.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE = 'http://localhost:3001';
const ADMIN_USER_ID = 'aurora4'; // Your master admin

// Helper function to make API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const fetch = (await import('node-fetch')).default;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return await response.json();
}

// List all users
async function listUsers() {
  console.log('\n📊 Current Users:');
  console.log('==================');
  
  try {
    const result = await apiRequest(`/admin/users?adminUserId=${ADMIN_USER_ID}`);
    
    if (result.error) {
      console.error('❌ Error:', result.error);
      return;
    }
    
    result.users.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '👑' : '👤';
      const passwordStatus = user.hasPassword ? '🔐' : '🔓';
      console.log(`${index + 1}. ${roleIcon} ${user.name} (${user.id})`);
      console.log(`   📧 ${user.email} | Role: ${user.role} | ${passwordStatus}`);
      console.log('');
    });
    
    console.log(`Total users: ${result.total}\n`);
  } catch (error) {
    console.error('❌ Failed to list users:', error.message);
  }
}

// Delete a user
async function deleteUser(userId) {
  if (userId === 'aurora4') {
    console.log('❌ Cannot delete master admin account');
    return;
  }
  
  try {
    const result = await apiRequest('/admin/delete-user', 'DELETE', {
      userId,
      adminUserId: ADMIN_USER_ID
    });
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`📊 Remaining users: ${result.remainingUsers}`);
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Failed to delete user:', error.message);
  }
}

// Update user role
async function updateUserRole(userId, newRole) {
  try {
    const result = await apiRequest('/admin/update-user-role', 'POST', {
      userId,
      newRole,
      adminUserId: ADMIN_USER_ID
    });
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Failed to update user role:', error.message);
  }
}

// Interactive menu
function showMenu() {
  console.log('\n🛠️  GuideOps Admin Panel');
  console.log('========================');
  console.log('1. List all users');
  console.log('2. Delete a demo user');
  console.log('3. Promote user to admin');
  console.log('4. Demote user to regular user');
  console.log('5. Quick cleanup (delete all demo users)');
  console.log('6. Exit');
  console.log('');
}

// Quick cleanup function
async function quickCleanup() {
  console.log('\n🧹 Quick Cleanup Mode');
  console.log('This will delete all demo users except aurora4');
  
  rl.question('Are you sure? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Cleanup cancelled');
      main();
      return;
    }
    
    // List of demo users to delete (excluding aurora4)
    const demoUsers = ['ben', 'user-test-001', 'ben-johns-3swgqqnt', 'ben-johns-qrfurnq7'];
    
    for (const userId of demoUsers) {
      console.log(`🗑️  Deleting ${userId}...`);
      await deleteUser(userId);
    }
    
    console.log('\n✅ Cleanup complete!');
    console.log('💡 Only registered users and aurora4 (master admin) remain');
    
    await listUsers();
    main();
  });
}

// Main interactive loop
function main() {
  showMenu();
  
  rl.question('Choose an option (1-6): ', async (choice) => {
    switch (choice) {
      case '1':
        await listUsers();
        main();
        break;
        
      case '2':
        rl.question('Enter user ID to delete: ', async (userId) => {
          await deleteUser(userId);
          main();
        });
        break;
        
      case '3':
        rl.question('Enter user ID to promote to admin: ', async (userId) => {
          await updateUserRole(userId, 'admin');
          main();
        });
        break;
        
      case '4':
        rl.question('Enter user ID to demote to user: ', async (userId) => {
          await updateUserRole(userId, 'user');
          main();
        });
        break;
        
      case '5':
        await quickCleanup();
        break;
        
      case '6':
        console.log('👋 Goodbye!');
        rl.close();
        break;
        
      default:
        console.log('❌ Invalid option');
        main();
        break;
    }
  });
}

// Start the script
console.log('🚀 Starting GuideOps Admin Panel...');
console.log('Make sure your backend server is running on http://localhost:3001\n');

main();
