import React, { useState } from 'react';
import { TorrentServer as TorrentServerType } from './types';
import { useUpdateTorrentServerMutation, useDeleteTorrentServerMutation, useGetTorrentClientTypesQuery } from './downloadManagerApi';

interface TorrentServerProps {
  server: TorrentServerType;
  onDeleted?: () => void;
}

export const TorrentServer: React.FC<TorrentServerProps> = ({ server, onDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    address: server.address,
    type: server.type,
  });

  const [updateTorrentServer, { isLoading: isUpdating }] = useUpdateTorrentServerMutation();
  const [deleteTorrentServer, { isLoading: isDeleting }] = useDeleteTorrentServerMutation();
  const { data: clientTypes = [] } = useGetTorrentClientTypesQuery();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      address: server.address,
      type: server.type,
    });
  };

  const handleSave = async () => {
    if (!server.id) return;
    
    try {
      await updateTorrentServer({
        id: server.id.toString(),
        server: editForm,
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update torrent server:', error);
    }
  };

  const handleDelete = async () => {
    if (!server.id) return;
    
    if (window.confirm('Are you sure you want to delete this torrent server?')) {
      try {
        await deleteTorrentServer(server.id.toString()).unwrap();
        onDeleted?.();
      } catch (error) {
        console.error('Failed to delete torrent server:', error);
      }
    }
  };

  const handleInputChange = (field: keyof typeof editForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isEditing) {
    return (
      <div className="card">
        <header className="card-header">
          <p className="card-header-title">Edit Torrent Server</p>
        </header>
        <div className="card-content">
          <div className="field">
            <label className="label" htmlFor="address">Address:</label>
            <div className="control">
              <input
                className="input"
                type="text"
                id="address"
                value={editForm.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={isUpdating}
              />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="type">Type:</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  id="type"
                  value={editForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  disabled={isUpdating}
                >
                  {clientTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <footer className="card-footer">
          <button 
            onClick={handleSave} 
            disabled={isUpdating}
            className={`button is-success card-footer-item ${isUpdating ? 'is-loading' : ''}`}
          >
            Save
          </button>
          <button 
            onClick={handleCancel} 
            disabled={isUpdating}
            className="button card-footer-item"
          >
            Cancel
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">{server.address}</p>
        <div className="card-header-icon">
          <div className="buttons">
            <button onClick={handleEdit} className="button is-small is-info">
              <span className="icon is-small">
                <i className="fas fa-edit"></i>
              </span>
              <span>Edit</span>
            </button>
            <button 
              onClick={handleDelete} 
              disabled={isDeleting}
              className={`button is-small is-danger ${isDeleting ? 'is-loading' : ''}`}
            >
              <span className="icon is-small">
                <i className="fas fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </header>
      <div className="card-content">
        <div className="content">
          <div className="field is-horizontal">
            <div className="field-label is-normal">
              <label className="label">Address:</label>
            </div>
            <div className="field-body">
              <div className="field">
                <p className="control">
                  <span className="tag is-light">{server.address}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="field is-horizontal">
            <div className="field-label is-normal">
              <label className="label">Type:</label>
            </div>
            <div className="field-body">
              <div className="field">
                <p className="control">
                  <span className="tag is-info">{server.type}</span>
                </p>
              </div>
            </div>
          </div>
          {server.created_at && (
            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Created:</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control">
                    <span className="tag is-light">{new Date(server.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
