# Aurora Chat

A comprehensive real-time chat application built with React and TypeScript, featuring Stream Chat integration and multiple example implementations.

## Project Structure

This repository contains:

- **Main Aurora Chat Application**: A React/TypeScript chat application with Stream Chat integration
- **guideops-chat/**: Complete Stream Chat implementation with admin controls and user management
- **website-react-examples/**: Multiple chat application examples including:
  - Social Messenger (JavaScript & TypeScript versions)
  - Team Chat (JavaScript & TypeScript versions)
  - Virtual Event platform
  - Gaming Livestream chat
  - Customer Support chat

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Stream Chat account and API keys

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AuroraBackcountry/guideops-chat.git
cd guideops-chat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Stream Chat API keys and configuration

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Features

- Real-time messaging with Stream Chat
- User authentication and profile management
- Admin controls and user management
- Multiple chat application examples
- TypeScript support
- Responsive design
- Modern React patterns and hooks

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

For Stream Chat integration, visit the [Stream Chat documentation](https://getstream.io/chat/docs/).
