import React, { useState } from 'react';
import { useChannelStateContext, useChatContext } from 'stream-chat-react';

interface ChannelInfoModalProps {
  onClose: () => void;
}

export const ChannelInfoModal: React.FC<ChannelInfoModalProps> = ({ onClose }) => {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  const [editingName, setEditingName] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [managingMembers, setManagingMembers] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  if (!channel) return null;

  const isPrivate = channel.data?.private || channel.data?.invite_only;
  const memberCount = Object.keys(channel.state.members || {}).length;
  const isAdmin = client.user?.role === 'admin' || client.user?.role === 'channel_moderator';

  const channelMembers = Object.values(channel.state.members || {}).map(member => member.user).filter(Boolean);

  const handleEditChannel = () => {
    setEditingName(true);
    setNewChannelName(channel.data?.name || '');
  };

  const handleSaveChannelName = async () => {
    if (!newChannelName.trim()) return;
    
    try {
      await channel.update({ name: newChannelName }, { text: `Channel name changed to ${newChannelName}` });
      setEditingName(false);
      alert('Channel name updated successfully!');
    } catch (error) {
      console.error('Failed to update channel name:', error);
      alert('Failed to update channel name');
    }
  };

  const handleTogglePrivacy = async () => {
    try {
      const newPrivacyState = !isPrivate;
      
      // Try to update via backend server first (more likely to have proper permissions)
      try {
        const response = await fetch('http://localhost:3001/update-channel-privacy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelId: channel.id,
            channelType: channel.type,
            private: newPrivacyState,
            invite_only: newPrivacyState,
          }),
        });
        
        if (response.ok) {
          alert(`Channel is now ${newPrivacyState ? 'private' : 'public'}`);
          return;
        }
      } catch (backendError) {
        console.log('Backend update failed, trying client-side update...');
      }
      
      // Fallback to client-side update
      const updateData: any = {};
      if (newPrivacyState) {
        updateData.private = true;
        updateData.invite_only = true;
      } else {
        updateData.private = false;
        updateData.invite_only = false;
      }
      
      await channel.update(updateData, { 
        text: `Channel is now ${newPrivacyState ? 'private' : 'public'}` 
      });
      
      alert(`Channel is now ${newPrivacyState ? 'private' : 'public'}`);
    } catch (error) {
      console.error('Failed to update channel privacy:', error);
      alert('Failed to update channel privacy. This operation may require additional permissions.');
    }
  };

  const handleManageMembers = async () => {
    setManagingMembers(true);
    setLoading(true);
    
    try {
      const response = await client.queryUsers({}, { id: 1 }, { limit: 100 });
      setAllUsers(response.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await channel.addMembers([userId]);
      alert(`Added user to channel`);
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm(`Remove this user from the channel?`)) {
      try {
        await channel.removeMembers([userId]);
        alert(`Removed user from channel`);
      } catch (error) {
        console.error('Failed to remove member:', error);
        alert('Failed to remove member');
      }
    }
  };

  const handleDeleteChannel = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm(`⚠️ Are you sure you want to delete this channel? This action cannot be undone!`)) {
      try {
        await channel.delete();
        alert('Channel deleted successfully');
        onClose(); // Close the modal
        // Note: The UI should automatically update via Stream's real-time updates
      } catch (error) {
        console.error('Failed to delete channel:', error);
        alert('Failed to delete channel. You may not have permission.');
      }
    }
  };

  return (
    <div className='channel-info-modal__backdrop' onClick={onClose}>
      <div className='channel-info-modal' onClick={(e) => e.stopPropagation()}>
        <div className='channel-info-modal__header'>
          <div className='channel-info-modal__title'>
            <span className='channel-icon'>{isPrivate ? '🔒' : '#'}</span>
            <h3>{channel.data?.name || channel.id}</h3>
          </div>
          <button className='channel-info-modal__close' onClick={onClose}>✕</button>
        </div>

        <div className='channel-info-modal__content'>
          <div className='channel-info-section'>
            <h4>📋 Channel Information</h4>
            <div className='channel-info-item'>
              <strong>Type:</strong> {channel.type}
            </div>
            <div className='channel-info-item'>
              <strong>Name:</strong> 
              {editingName ? (
                <div className='edit-name-controls'>
                  <input 
                    type='text'
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className='edit-name-input'
                    placeholder='Channel name'
                  />
                  <button onClick={handleSaveChannelName} className='save-btn'>💾</button>
                  <button onClick={() => setEditingName(false)} className='cancel-btn'>❌</button>
                </div>
              ) : (
                <span>{channel.data?.name || 'Unnamed'}</span>
              )}
            </div>
            <div className='channel-info-item'>
              <strong>Privacy:</strong> 
              <span className={isPrivate ? 'private' : 'public'}>
                {isPrivate ? '🔒 Private' : '📢 Public'}
              </span>
            </div>
            <div className='channel-info-item'>
              <strong>Channel ID:</strong> {channel.id}
            </div>
            <div className='channel-info-item'>
              <strong>Created:</strong> {channel.data?.created_at ? new Date(channel.data.created_at).toLocaleDateString() : 'Unknown'}
            </div>
            <div className='channel-info-item'>
              <strong>Members:</strong> {memberCount}
            </div>
          </div>

          <div className='channel-info-section'>
            <h4>👥 Channel Members ({memberCount})</h4>
            {!managingMembers ? (
              <div className='channel-members-list'>
                {channelMembers.map((user) => (
                  <div key={user?.id} className='channel-member-item'>
                    <img 
                      src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                      alt={user?.name || user?.id}
                      className='channel-member-avatar'
                    />
                    <div className='channel-member-info'>
                      <div className='channel-member-name'>{user?.name || user?.id}</div>
                      <div className='channel-member-role'>
                        {channel.state.members[user?.id || '']?.role === 'moderator' ? '👑 Moderator' : '👤 Member'}
                        {user?.id === client.userID && ' (You)'}
                      </div>
                    </div>
                    <div className='channel-member-actions'>
                      <span className='channel-member-status'>
                        {user?.online ? '🟢' : '⚪'}
                      </span>
                      {isAdmin && user?.id !== client.userID && (
                        <button 
                          className='remove-member-btn'
                          onClick={() => handleRemoveMember(user?.id || '')}
                          title='Remove from channel'
                        >
                          ➖
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='member-management-panel'>
                <div className='member-management-header'>
                  <h5>Add New Members</h5>
                  <button onClick={() => setManagingMembers(false)} className='close-manage-btn'>❌</button>
                </div>
                {loading ? (
                  <div className='loading'>Loading users...</div>
                ) : (
                  <div className='available-users-list'>
                    {allUsers.filter(user => !channelMembers.find(member => member?.id === user.id)).map((user) => (
                      <div key={user.id} className='available-user-item'>
                        <img 
                          src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                          alt={user.name || user.id}
                          className='available-user-avatar'
                        />
                        <div className='available-user-info'>
                          <div className='available-user-name'>{user.name || user.id}</div>
                          <div className='available-user-role'>{user.role || 'user'}</div>
                        </div>
                        <button 
                          className='add-member-btn'
                          onClick={() => handleAddMember(user.id)}
                        >
                          ➕ Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isAdmin && !managingMembers && (
            <div className='channel-info-section'>
              <h4>🔧 Admin Actions</h4>
              <div className='channel-info-actions'>
                <button 
                  className='channel-action-btn edit'
                  onClick={handleEditChannel}
                >
                  ✏️ Edit Channel Name
                </button>
                <button 
                  className='channel-action-btn manage'
                  onClick={handleManageMembers}
                >
                  👥 Manage Members
                </button>
                <button 
                  className={`channel-action-btn ${isPrivate ? 'public' : 'private'}`}
                  onClick={handleTogglePrivacy}
                  title={isPrivate ? 'Make channel public - anyone can join' : 'Make channel private - invite only'}
                >
                  {isPrivate ? '📢 Make Public' : '🔒 Make Private'}
                </button>
                <button 
                  className='channel-action-btn delete'
                  onClick={handleDeleteChannel}
                  title='Permanently delete this channel'
                >
                  🗑️ Delete Channel
                </button>
              </div>
              <div className='admin-note'>
                <small>⚠️ Note: Only admins and channel moderators can delete channels</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
