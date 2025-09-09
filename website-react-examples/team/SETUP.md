# Aurora Team Chat - Setup Guide

Welcome to your customized Stream Chat team application! 🚀

## Quick Start

### 1. Get Your Stream API Credentials

1. **Sign up for Stream**: Go to [getstream.io/chat/trial/](https://getstream.io/chat/trial/) and create a free account
2. **Create a new app** in your Stream Dashboard
3. **Copy your API Key** from the app dashboard
4. **Generate user tokens** for testing (or use the token generator in the dashboard)

### 2. Configure Your Environment

Update the `.env` file in this directory with your credentials:

```bash
# Stream Chat Configuration
REACT_APP_STREAM_KEY=your_api_key_here
REACT_APP_USER_ID=ben_johns
REACT_APP_USER_TOKEN=your_user_token_here
REACT_APP_TARGET_ORIGIN=*
```

### 3. Run the Application

```bash
# Install dependencies (already done)
yarn install

# Start the development server
yarn start
```

Your app will be available at `http://localhost:3000`

## What's Been Customized

✅ **Branding**: Updated to "Aurora Chat" with a custom star logo
✅ **Colors**: Changed primary color to a modern indigo (#6366f1)
✅ **App Name**: Renamed to "aurora-team-chat"
✅ **User Setup**: Configured for user "ben_johns"

## Features Included

- 💬 **Team Channels**: Create and join team channels
- 🧵 **Threading**: Reply to messages in threads
- 📎 **File Sharing**: Drag and drop files and images
- 😄 **Reactions**: React to messages with emojis
- 🔍 **Search**: Search messages and conversations
- 🎯 **Slash Commands**: Use /giphy and other commands
- 📌 **Pinned Messages**: Pin important messages
- 👥 **Direct Messages**: One-on-one conversations

## Development Tips

### For Testing Without Real Credentials

You can use Stream's demo credentials for testing:
- API Key: `dz5f4d5kzrue` (demo key)
- Generate test tokens in the Stream dashboard

### Customization

- **Colors**: Edit `src/App.css` to change the color scheme
- **Logo**: Update `src/assets/SideBarLogo.js` for your logo
- **Company Name**: Modify `src/components/ChannelListContainer/ChannelListContainer.js`

## Deployment

1. **Build for production**:
   ```bash
   yarn build
   ```

2. **Deploy to your favorite platform**:
   - Vercel: `vercel --prod`
   - Netlify: Drag the `build` folder to netlify.com/drop
   - AWS S3: Upload the `build` folder contents

## Support

- 📚 [Stream Chat React Documentation](https://getstream.io/chat/docs/react/)
- 🎯 [Stream Chat API Reference](https://getstream.io/chat/docs/rest/)
- 💬 [Community Support](https://github.com/GetStream/stream-chat-react)

Happy chatting! 🎉
