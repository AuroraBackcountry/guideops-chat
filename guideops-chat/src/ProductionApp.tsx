import React, { useState, useEffect } from 'react';
import { StreamChat, TextComposerMiddleware } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Login } from './components/Login/Login';
import { Register } from './components/Register/Register';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { useChecklist } from './ChecklistTasks';
import { ChannelContainer } from './components/ChannelContainer/ChannelContainer';
import { Sidebar } from './components/Sidebar/Sidebar';
import { WorkspaceController } from './context/WorkspaceController';

import {
  createDraftGiphyCommandInjectionMiddleware,
  createGiphyCommandInjectionMiddleware
} from "./middleware/composition/giphyCommandInjectionMiddleware";
import { createGiphyCommandControlMiddleware } from "./middleware/textComposition/giphyCommandControl";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user: User;
  streamToken: string;
  streamApiKey: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

const ProductionApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showRegister, setShowRegister] = useState(false);

  const handleGoogleLogin = async (googleCredential: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: googleCredential }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Google authentication failed');
      }

      const data: AuthResponse = await response.json();
      await connectToStream(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const connectToStream = async (data: AuthResponse) => {
    try {
      console.log('🔄 Connecting to Stream with user:', data.user);
      
      // Create Stream client
      const streamClient = StreamChat.getInstance(data.streamApiKey, { 
        enableInsights: true, 
        enableWSFallback: true 
      });

      // Connect user to Stream
      await streamClient.connectUser(
        {
          id: data.user.id,
          name: data.user.name,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`
        },
        data.streamToken
      );
      
      console.log('✅ Successfully connected to Stream');
      
      // Set up middleware (same as before)
      streamClient.setMessageComposerSetupFunction(({ composer }) => {
      composer.compositionMiddlewareExecutor.insert({
        middleware: [
          createGiphyCommandInjectionMiddleware(composer)
        ],
        position: { after: 'stream-io/message-composer-middleware/attachments' }
      });
      composer.draftCompositionMiddlewareExecutor.insert({
        middleware: [
          createDraftGiphyCommandInjectionMiddleware(composer)
        ],
        position: { after: 'stream-io/message-composer-middleware/draft-attachments' }
      });
      composer.textComposer.middlewareExecutor.insert({
        middleware: [
          createGiphyCommandControlMiddleware(composer) as TextComposerMiddleware,
        ],
        position: { after: 'stream-io/message-composer-middleware/text-composer-text-input' }
      });
      });

      setUser(data.user);
      setClient(streamClient);
    } catch (streamError) {
      console.error('❌ Stream connection failed:', streamError);
      const errorMessage = streamError instanceof Error ? streamError.message : 'Unknown error';
      throw new Error(`Stream connection failed: ${errorMessage}`);
    }
  };

  const handleRegister = async (userData: { email: string; name: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      await connectToStream(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials: { userId: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data: AuthResponse = await response.json();
      await connectToStream(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (client) {
      await client.disconnectUser();
      setClient(null);
    }
    setUser(null);
    setError('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [client]);

  // Show login/register screen if not authenticated
  if (!user || !client) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {showRegister ? (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => setShowRegister(false)}
            loading={loading}
            error={error}
          />
        ) : (
          <Login 
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            onSwitchToRegister={() => setShowRegister(true)}
            loading={loading} 
            error={error} 
          />
        )}
      </GoogleOAuthProvider>
    );
  }

  // Show chat app if authenticated
  return (
    <ErrorBoundary>
      <div className="app__wrapper">
        <Chat client={client} theme="team light">
          <WorkspaceController>
            <Sidebar />
            <ChannelContainer />
          </WorkspaceController>
        </Chat>
      </div>
    </ErrorBoundary>
  );
};

export default ProductionApp;
