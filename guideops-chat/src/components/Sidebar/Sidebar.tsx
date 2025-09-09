import { ChannelList, useChatContext } from 'stream-chat-react';

import {
    EmptyDMChannelListIndicator,
    EmptyGroupChannelListIndicator
} from "./EmptyChannelListIndicator";
import { ChannelSearch } from '../ChannelSearch/ChannelSearch';
import { TeamChannelList } from '../TeamChannelList/TeamChannelList';
import { ChannelPreview } from '../ChannelPreview/ChannelPreview';
import { useWorkspaceController } from '../../context/WorkspaceController';

import { CompanyLogo } from './icons';

import type { Channel, ChannelFilters } from 'stream-chat';
import { ChannelSort } from 'stream-chat';



const TeamChannelsList = () => {
  const { client } = useChatContext();
  
  // Simplified filters - show channels user has access to
  const filters: ChannelFilters = {
    type: 'team',
    members: { $in: [client.userID!] } // Only show channels user is a member of
  };

  return (
    <ChannelList
      channelRenderFilterFn={customChannelTeamFilter}
      filters={filters}
      options={options}
      sort={sort}
      EmptyStateIndicator={EmptyGroupChannelListIndicator}
      List={(listProps) => (
        <TeamChannelList
          {...listProps}
          type='team'
        />
      )}
      Preview={(previewProps) => (
        <ChannelPreview
          {...previewProps}
          type='team'
        />
      )}
    />
  );
};

const MessagingChannelsList = () => {
  const { client } = useChatContext();
  
  // Dynamic filters for messaging channels
  const filters: ChannelFilters = {
    type: 'messaging',
    $or: [
      { demo: 'team' }, // Demo channels  
      { members: { $in: [client.userID!] } } // Channels user is member of
    ]
  };

  return (
    <ChannelList
      channelRenderFilterFn={customChannelMessagingFilter}
      filters={filters}
      options={options}
      sort={sort}
      setActiveChannelOnMount={false}
      EmptyStateIndicator={EmptyDMChannelListIndicator}
      List={(listProps) => (
        <TeamChannelList
          {...listProps}
          type='messaging'
        />
      )}
      Preview={(previewProps) => (
        <ChannelPreview
          {...previewProps}
          type='messaging'
        />
      )}
    />
  );
};

const options = { state: true, watch: true, presence: true, limit: 3 };
const sort: ChannelSort = { last_message_at: -1, updated_at: -1 };

const FakeCompanySelectionBar = () => (
  <div className='sidebar__company-selection-bar'>
    <div className='sidebar__company-badge'>
        <CompanyLogo />
    </div>
  </div>
);

const customChannelTeamFilter = (channels: Channel[]) => {
  return channels.filter((channel) => channel.type === 'team');
};

const customChannelMessagingFilter = (channels: Channel[]) => {
  return channels.filter((channel) => channel.type === 'messaging');
};


const PublicControls = () => {
  const { displayWorkspace } = useWorkspaceController();
  
  return (
    <div className='admin-controls'>
      <div className='admin-controls__header'>
        <span className='admin-controls__title'>📢 Create Public</span>
      </div>
      <div className='admin-controls__buttons'>
        <button 
          className='admin-controls__button'
          onClick={() => displayWorkspace('Admin-Channel-Create__team')}
          title='Create public team channel'
        >
          ➕ Create Channel
        </button>
        <button 
          className='admin-controls__button'
          onClick={() => displayWorkspace('Admin-Channel-Create__messaging')}
          title='Create message group'
        >
          💬 New DM Group
        </button>
      </div>
    </div>
  );
};

const AdminControls = () => {
  const { displayWorkspace } = useWorkspaceController();
  const { client } = useChatContext();
  
  // Check if user has admin role
  const isAdmin = client.user?.role === 'admin' || client.user?.role === 'channel_moderator';
  
  // Don't show admin controls if user is not an admin
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className='admin-controls'>
      <div className='admin-controls__header'>
        <span className='admin-controls__title'>🔒 Admin Only</span>
      </div>
      <div className='admin-controls__buttons'>
        <button 
          className='admin-controls__button private-channel'
          onClick={() => displayWorkspace('Admin-Channel-Create__team')}
          title='Create private team channel (Admin Only)'
        >
          🔒 Create Private Channel
        </button>
        <button 
          className='admin-controls__button'
          onClick={() => displayWorkspace('Admin-Channel-Create__messaging')}
          title='Create private message group (Admin Only)'
        >
          🔐 Private DM Group
        </button>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <div className='sidebar'>
      <FakeCompanySelectionBar />
      <div className='channel-list-bar'>
        <div className='channel-list-bar__header'>
          <p className='channel-list-bar__header__text'>GuideOps</p>
        </div>
        <ChannelSearch />
        <TeamChannelsList/>
        <MessagingChannelsList/>
      </div>
    </div>
  );
};
