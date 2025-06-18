import React, { useState } from 'react';
import { Torrent as TorrentType } from './types';
import { useUpdateTorrentMutation, useDeleteTorrentMutation, useGetTorrentServersQuery, useMarkTorrentIncompleteMutation } from './downloadManagerApi';

interface TorrentProps {
  torrent: TorrentType;
  onDeleted?: () => void;
}

const createDateFromTimestamp = (
  timestamp: string | number,
  timezone?: string | number
): Date => {
  const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  
  // Convert to milliseconds
  const utcTime = timestampNum * 1000;
  
  return new Date(utcTime);
};

export const Torrent: React.FC<TorrentProps> = ({ torrent, onDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    server_id: torrent.server_id,
    magnetURI: torrent.magnetURI,
    name: torrent.name || '',
    completed_at: torrent.completed_at || '',
  });

  const [updateTorrent, { isLoading: isUpdating }] = useUpdateTorrentMutation();
  const [deleteTorrent, { isLoading: isDeleting }] = useDeleteTorrentMutation();
  const [markIncomplete, { isLoading: isMarkingIncomplete }] = useMarkTorrentIncompleteMutation();
  const { data: servers = [] } = useGetTorrentServersQuery();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      server_id: torrent.server_id,
      magnetURI: torrent.magnetURI,
      name: torrent.name || '',
      completed_at: torrent.completed_at || '',
    });
  };

  const handleSave = async () => {
    if (!torrent.id) return;
    
    try {
      await updateTorrent({
        id: torrent.id.toString(),
        torrent: editForm,
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update torrent:', error);
    }
  };

  const handleDelete = async () => {
    if (!torrent.id) return;
    
    if (window.confirm('Are you sure you want to delete this torrent?')) {
      try {
        await deleteTorrent(torrent.id.toString()).unwrap();
        onDeleted?.();
      } catch (error) {
        console.error('Failed to delete torrent:', error);
      }
    }
  };

  const handleMarkIncomplete = async () => {
    if (!torrent.id) return;
    
    if (window.confirm('Are you sure you want to mark this torrent as incomplete?')) {
      try {
        await markIncomplete(torrent.id.toString()).unwrap();
      } catch (error) {
        console.error('Failed to mark torrent as incomplete:', error);
      }
    }
  };

  const handleInputChange = (field: keyof typeof editForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not completed';
    return new Date(dateString).toLocaleDateString();
  };

  const getServerName = () => {
    const server = servers.find(server => server.id == torrent.server_id);
    return server ? `${server.address}` : 'Unknown Server';
  };

  if (isEditing) {
    return (
      <tr className="is-selected">
        <td colSpan={7}>
          <div className="box">
            <h4 className="title is-5">Edit Torrent</h4>
            <div className="columns">
              <div className="column">
                <div className="field">
                  <label className="label">Local Node:</label>
                  <div className="control">
                    <input className="input" type="text" value={torrent.local_node} disabled />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Server:</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={editForm.server_id}
                        onChange={(e) => handleInputChange('server_id', e.target.value)}
                        disabled={isUpdating}
                      >
                        {servers.map((server) => (
                          <option key={server.id} value={server.id}>
                            {server.address}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label">Name:</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={isUpdating}
                      placeholder="Torrent name"
                    />
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="field">
                  <label className="label">Magnet URI:</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      value={editForm.magnetURI}
                      onChange={(e) => handleInputChange('magnetURI', e.target.value)}
                      disabled={isUpdating}
                      placeholder="magnet:?xt=urn:btih:..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Hash String:</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      value={torrent.hash_string || 'No hash'}
                      disabled
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label">User ID:</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      value={torrent.user_id || 'No user assigned'}
                      disabled
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Completed At:</label>
                  <div className="control">
                    <input
                      className="input"
                      type="datetime-local"
                      value={editForm.completed_at}
                      onChange={(e) => handleInputChange('completed_at', e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <button 
                  onClick={handleSave} 
                  disabled={isUpdating}
                  className={`button is-success ${isUpdating ? 'is-loading' : ''}`}
                >
                  Save
                </button>
              </div>
              <div className="control">
                <button 
                  onClick={handleCancel} 
                  disabled={isUpdating}
                  className="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log(new Date(torrent.created_at!).toLocaleString('en-US', { 
                timeZone: 'UTC'
           }));
  console.log(new Date(torrent.created_at!).toLocaleString());

  return (
    <tr>
      <td>
        <strong>{torrent.name || 'Unnamed Torrent'}</strong>
        {torrent.magnetURI && (
          <>
            <br />
            <small className="has-text-grey" title={torrent.magnetURI}>
              {torrent.magnetURI.length > 50 
                ? torrent.magnetURI.substring(0, 50) + '...' 
                : torrent.magnetURI
              }
            </small>
          </>
        )}
      </td>
      <td>
        <span className={`tag ${torrent.completed_at ? 'is-success' : 'is-warning'}`}>
          {torrent.completed_at ? 'Completed' : 'In Progress'}
        </span>
      </td>
      <td>
        <span className="tag is-light">{getServerName()}</span>
      </td>
      <td>
        {torrent.hash_string ? (
          <span className="tag is-info" title={torrent.hash_string}>
            {torrent.hash_string.substring(0, 12)}...
          </span>
        ) : (
          <span className="tag is-light">No hash</span>
        )}
      </td>
      <td>
        {torrent.created_at && (
          <span className="tag is-light">
            {new Date(torrent.created_at).toLocaleString('en-US', { 
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
           })}</span>
        )}
      </td>
      <td>
        <div className="buttons are-small" style={{ display: 'flex', gap: '0.25rem' }}>
          <button onClick={handleEdit} className="button is-small is-info" style={{ flex: '1', minWidth: '120px' }}>
            <span className="icon is-small">
              <i className="fas fa-edit"></i>
            </span>
            <span>Edit</span>
          </button>
          {torrent.completed_at && (
            <button 
              onClick={handleMarkIncomplete} 
              disabled={isMarkingIncomplete}
              className={`button is-small is-warning ${isMarkingIncomplete ? 'is-loading' : ''}`}
              style={{ flex: '1', minWidth: '120px' }}
            >
              <span className="icon is-small">
                <i className="fas fa-undo"></i>
              </span>
              <span>Mark Incomplete</span>
            </button>
          )}
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className={`button is-small is-danger ${isDeleting ? 'is-loading' : ''}`}
            style={{ flex: '1', minWidth: '120px' }}
          >
            <span className="icon is-small">
              <i className="fas fa-trash"></i>
            </span>
            <span>Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};
