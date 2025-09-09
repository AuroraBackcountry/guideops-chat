# GuideOps Team Chat

A comprehensive real-time team chat application built with React and TypeScript, featuring Stream Chat integration, admin controls, and production-ready authentication.

## Project Structure

This repository contains the **GuideOps Team Chat** application - a professional team communication platform with:

- **Team Chat Application** (`website-react-examples/team-ts/`): Main TypeScript/React chat application
- **Production Features**: Server-side authentication, user management, admin controls
- **Advanced Features**: Message threading, file attachments, emoji reactions, Giphy integration

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and uses TypeScript.

### Prerequisites

- Node.js (v16 or higher)
- Yarn (recommended) or npm
- Stream Chat account and API keys

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AuroraBackcountry/guideops-chat.git
cd guideops-chat/website-react-examples/team-ts
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.development`
   - Add your Stream Chat API keys and configuration

4. Start the development server:
```bash
yarn start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

Navigate to the `website-react-examples/team-ts/` directory to run these commands:

### `yarn start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn dev`

Runs both the frontend and backend server concurrently for full-stack development.

### `yarn server`

Starts the Node.js backend server for production authentication.

### `yarn build`

Builds the app for production to the `build` folder.\
The build is optimized for the best performance.

### `yarn test`

Launches the test runner in interactive watch mode.

## Features

- **Real-time Team Chat**: Instant messaging with Stream Chat integration
- **Production Authentication**: Server-side token generation and user management
- **Admin Controls**: Channel management, user permissions, and moderation tools
- **Advanced Messaging**: Message threading, reactions, file attachments
- **Giphy Integration**: Built-in GIF search and sharing
- **TypeScript Support**: Full type safety and excellent developer experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **SCSS Architecture**: Organized, maintainable styling system

## Production Deployment

For production deployment instructions, see:
- `website-react-examples/team-ts/PRODUCTION-SETUP.md` - Complete production setup guide
- `website-react-examples/team-ts/GOOGLE-OAUTH-SETUP.md` - OAuth integration setup

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Stream Chat documentation](https://getstream.io/chat/docs/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
