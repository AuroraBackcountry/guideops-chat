const StreamChat = require('stream-chat').StreamChat;
require('dotenv/config');

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

const client = StreamChat.getInstance(apiKey, apiSecret);

async function checkSimpleState() {
  try {
    console.log('🔍 Checking current state after cleanup...');
    
    // Check current users
    console.log('\n👥 Current users in Stream:');
    try {
      const response = await client.queryUsers({}, { id: 1 }, { limit: 50 });
      console.log(`Found ${response.users.length} users:`);
      response.users.forEach(user => {
        console.log(`  - ${user.id} (${user.name || 'No name'}) - Role: ${user.role || 'user'}`);
      });
    } catch (userError) {
      console.log('❌ Error querying users:', userError.message);
    }
    
    // Check current channels
    console.log('\n📋 Current channels in Stream:');
    try {
      const channels = await client.queryChannels({ type: 'team' }, { updated_at: -1 }, { limit: 50 });
      console.log(`Found ${channels.length} team channels:`);
      
      channels.forEach(channel => {
        const name = channel.data?.name || 'No name';
        const members = Object.keys(channel.state?.members || {});
        console.log(`  - ${channel.id} (${name}) - Members: ${members.length}`);
        
        if (channel.id === 'general') {
          console.log(`    General channel members: ${members.join(', ')}`);
        }
      });
    } catch (channelError) {
      console.log('❌ Error querying channels:', channelError.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking state:', error);
  }
}

checkSimpleState();

