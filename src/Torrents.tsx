import React, { useState } from 'react';
import { useGetTorrentsQuery, useCreateTorrentMutation, useGetTorrentServersQuery } from './downloadManagerApi';
import { Torrent } from './Torrent';
import { Torrent as TorrentType } from './types';

export const Torrents = () => {
  const { data: torrents, isLoading, error, refetch } = useGetTorrentsQuery();
  const { data: servers = [] } = useGetTorrentServersQuery();
  const [createTorrent, { isLoading: isCreating }] = useCreateTorrentMutation();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createForm, setCreateForm] = useState({
    server_id: '',
    user_id: '',
    magnetURI: '',
    hash_string: '',
    name: '',
  });

  const handleCreateFormChange = (field: keyof typeof createForm, value: string) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.server_id || !createForm.magnetURI) {
      alert('Please fill in required fields (Server and Magnet URI)');
      return;
    }

    try {
      const torrentData = {
        ...createForm,
        user_id: createForm.user_id || undefined,
        hash_string: createForm.hash_string || undefined,
        name: createForm.name || undefined,
      };
      
      await createTorrent(torrentData).unwrap();
      setCreateForm({
        server_id: '',
        user_id: '',
        magnetURI: '',
        hash_string: '',
        name: '',
      });
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to create torrent:', error);
      alert('Failed to create torrent');
    }
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
    setCreateForm({
      server_id: '',
      user_id: '',
      magnetURI: '',
      hash_string: '',
      name: '',
    });
  };

  const handleTorrentDeleted = () => {
    refetch();
  };

  // Filter torrents based on search term
  const filteredTorrents = torrents?.filter((torrent: TorrentType) =>
    torrent.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="notification is-info">Loading torrents...</div>;
  }

  if (error) {
    return <div className="notification is-danger">Error fetching torrents.</div>;
  }

  return (
    <div className="container">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h1 className="title">Torrents</h1>
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
              <span>Add New Torrent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="field">
        <div className="control has-icons-left">
          <input
            className="input"
            type="text"
            placeholder="Search torrents by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="icon is-small is-left">
            <i className="fas fa-search"></i>
          </span>
        </div>
      </div>

      {showCreateForm && (
        <div className="box">
          <h3 className="title is-4">Create New Torrent</h3>
          <form onSubmit={handleCreateSubmit}>
            <div className="field">
              <label className="label" htmlFor="create-server">Server: *</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select
                    id="create-server"
                    value={createForm.server_id}
                    onChange={(e) => handleCreateFormChange('server_id', e.target.value)}
                    disabled={isCreating}
                    required
                  >
                    <option value="">Select a server</option>
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
              <label className="label" htmlFor="create-name">Name:</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  id="create-name"
                  value={createForm.name}
                  onChange={(e) => handleCreateFormChange('name', e.target.value)}
                  disabled={isCreating}
                  placeholder="Enter torrent name"
                />
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="create-magnetURI">Magnet URI: *</label>
              <div className="control">
                <textarea
                  className="textarea"
                  id="create-magnetURI"
                  value={createForm.magnetURI}
                  onChange={(e) => handleCreateFormChange('magnetURI', e.target.value)}
                  disabled={isCreating}
                  placeholder="magnet:?xt=urn:btih:..."
                  required
                  rows={3}
                />
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className={`button is-primary ${isCreating ? 'is-loading' : ''}`}
                >
                  Create Torrent
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
        {!torrents || torrents.length === 0 ? (
          <div className="notification is-warning">
            <p><strong>No torrents found.</strong></p>
            <p>Click "Add New Torrent" to create your first torrent.</p>
          </div>
        ) : filteredTorrents.length === 0 ? (
          <div className="notification is-info">
            <p><strong>No torrents match your search.</strong></p>
            <p>Try adjusting your search term or <button className="button is-small is-text" onClick={() => setSearchTerm('')}>clear the search</button>.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table is-fullwidth is-striped is-hoverable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Server</th>
                  <th>Hash</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTorrents.map((torrent: TorrentType) => (
                  <Torrent 
                    key={torrent.id}
                    torrent={torrent} 
                    onDeleted={handleTorrentDeleted}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="box">
        <h3 className="title is-5">Statistics</h3>
        <div className="level">
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Total Torrents</p>
              <p className="title">{torrents?.length || 0}</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Showing</p>
              <p className="title">{filteredTorrents.length}</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Completed</p>
              <p className="title">{filteredTorrents.filter(t => t.completed_at).length}</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">In Progress</p>
              <p className="title">{filteredTorrents.filter(t => !t.completed_at).length}</p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Active Servers</p>
              <p className="title">{servers.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
