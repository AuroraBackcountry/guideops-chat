# GuideOps Team Chat

A production-ready team communication platform built with React 18, TypeScript 5, and Stream Chat. Features admin controls, user management, authentication, and a comprehensive messaging experience.

## ✨ Key Features

- **Real-time Team Chat**: Instant messaging with Stream Chat integration
- **Production Authentication**: Server-side token generation and secure user management
- **Admin Controls**: Channel management, user permissions, and moderation tools
- **Advanced Messaging**: Message threading, reactions, file attachments, and link previews
- **Giphy Integration**: Built-in GIF search and sharing
- **TypeScript 5**: Full type safety with modern TypeScript features
- **SCSS Architecture**: Organized, maintainable styling system
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🚀 Tech Stack

- **Frontend**: React 18.3.1, TypeScript 5.6.3, SCSS
- **Backend**: Node.js, Express 5.1.0
- **Chat**: Stream Chat React 13.6.2
- **Authentication**: Production-ready token server
- **Build**: Create React App with custom configurations

## 🛠️ Development Setup

1. **Clone and navigate**:
   ```bash
   git clone https://github.com/AuroraBackcountry/guideops-chat.git
   cd guideops-chat/website-react-examples/team-ts
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Environment setup**:
   ```bash
   cp .env-example .env.development
   # Edit .env.development with your Stream Chat credentials
   ```

4. **Start development**:
   ```bash
   yarn start          # Frontend only
   yarn dev           # Full-stack (frontend + backend)
   ```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Start development server (frontend only) |
| `yarn dev` | Start full-stack development (frontend + backend) |
| `yarn build` | Build production-optimized bundle |
| `yarn test` | Run test suite |
| `yarn server` | Start production backend server |
| `yarn server:dev` | Start development backend server |

## 🏗️ Production Deployment

For detailed production deployment instructions, see:
- **[PRODUCTION-SETUP.md](./PRODUCTION-SETUP.md)** - Complete production setup guide
- **[GOOGLE-OAUTH-SETUP.md](./GOOGLE-OAUTH-SETUP.md)** - OAuth integration setup

### Quick Production Build
```bash
yarn build              # Build optimized bundle
yarn server            # Start production server
```

## 🏛️ Project Architecture

### Frontend Structure
```
src/
├── components/           # React components
│   ├── AdminPanel/      # Admin controls and management
│   ├── TeamMessage/     # Custom message components
│   ├── TeamChannelHeader/ # Channel header customizations
│   └── ...              # Other feature components
├── styles/              # SCSS styling system
│   ├── _global_theme_variables.scss
│   ├── Component-specific styles/
│   └── Stream Chat overrides/
├── context/             # React context providers
├── middleware/          # Text composition middleware
└── types.stream.d.ts    # Stream Chat type extensions
```

### Backend Structure
- **token-server.js**: Production authentication server
- **users.json**: Development user database
- **.env.server**: Server environment configuration

## 🔧 Customizations

This project includes several Stream Chat customizations:
- **Custom Message Types**: Enhanced message formatting and display
- **Admin Controls**: User management, channel moderation
- **Authentication Flow**: Production-ready token generation
- **UI Theming**: Custom SCSS architecture with Stream Chat overrides
- **TypeScript Extensions**: Custom type definitions for enhanced type safety

## 📚 Learn More

- **[Stream Chat React Documentation](https://getstream.io/chat/docs/sdk/react/)**
- **[Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)**
- **[TypeScript Documentation](https://www.typescriptlang.org/docs/)**
- **[React Documentation](https://reactjs.org/)**

## 🤝 Quick Links

- [Stream Chat Component Reference](https://getstream.github.io/stream-chat-react/)
- [Get Stream Chat API Key](https://getstream.io/chat/trial/)
- [React Chat Tutorial](https://getstream.io/chat/react-chat/tutorial/)
- [Chat UI Kit](https://getstream.io/chat/ui-kit/)
