import React, { useState } from 'react';
import { useGetTorrentServersQuery, useCreateTorrentServerMutation, useGetTorrentClientTypesQuery } from './downloadManagerApi';
import { TorrentServer } from './TorrentServer';
import { TorrentServer as TorrentServerType } from './types';

export const TorrentServers = () => {
  const { data: servers, isLoading, error, refetch } = useGetTorrentServersQuery();
  const { data: clientTypes = [] } = useGetTorrentClientTypesQuery();
  const [createTorrentServer, { isLoading: isCreating }] = useCreateTorrentServerMutation();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    address: '',
    type: '',
  });

  const handleCreateFormChange = (field: keyof typeof createForm, value: string) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.address || !createForm.type) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await createTorrentServer(createForm).unwrap();
      setCreateForm({
        address: '',
        type: '',
      });
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to create torrent server:', error);
      alert('Failed to create torrent server');
    }
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
    setCreateForm({
      address: '',
      type: '',
    });
  };

  const handleServerDeleted = () => {
    refetch();
  };

  if (isLoading) {
    return <div className="notification is-info">Loading torrent servers...</div>;
  }

  if (error) {
    return <div className="notification is-danger">Error fetching torrent servers.</div>;
  }

  return (
    <div className="container">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h1 className="title">Torrent Servers</h1>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button 
              onClick={() => setShowCreateForm(true)}
              className="button is-primary"
              disabled={showCreateForm}
            >
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Add New Server</span>
            </button>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="box">
          <h3 className="title is-4">Create New Torrent Server</h3>
          <form onSubmit={handleCreateSubmit}>
            <div className="field">
              <label className="label" htmlFor="create-address">Address:</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  id="create-address"
                  value={createForm.address}
                  onChange={(e) => handleCreateFormChange('address', e.target.value)}
                  disabled={isCreating}
                  placeholder="Enter server address"
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="create-type">Type:</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select
                    id="create-type"
                    value={createForm.type}
                    onChange={(e) => handleCreateFormChange('type', e.target.value)}
                    disabled={isCreating}
                    required
                  >
                    <option value="">Select a type</option>
                    {clientTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className={`button is-primary ${isCreating ? 'is-loading' : ''}`}
                >
                  Create Server
                </button>
              </div>
              <div className="control">
                <button 
                  type="button" 
                  onClick={handleCreateCancel}
                  disabled={isCreating}
                  className="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="section">
        {!servers || servers.length === 0 ? (
          <div className="notification is-warning">
            <p><strong>No torrent servers found.</strong></p>
            <p>Click "Add New Server" to create your first server.</p>
          </div>
        ) : (
          <div className="columns is-multiline">
            {servers.map((server: TorrentServerType) => (
              <div key={server.id} className="column is-one-third">
                <TorrentServer 
                  server={server} 
                  onDeleted={handleServerDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
