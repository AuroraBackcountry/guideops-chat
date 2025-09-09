import React from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

const apiKey = process.env.REACT_APP_STREAM_KEY!;
const userId = process.env.REACT_APP_USER_ID!;
const userToken = process.env.REACT_APP_USER_TOKEN!;

const client = StreamChat.getInstance(apiKey);

// Connect user
client.connectUser(
  {
    id: userId,
    name: 'Team User',
    image: `https://getstream.io/random_svg/?id=${userId}&name=Team+User`,
  },
  userToken
);

const App: React.FC = () => {
  return (
    <Chat client={client} theme="team light">
      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};

export default App;
