/**
 * User list component for displaying and managing users
 */

import { useState, useEffect } from 'preact/hooks';
import { UserCard } from '../ui';
import {
  useAppDispatch,
  useAppSelector,
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  clearError,
} from '../../store';
import type { User } from '../../services/api';

// TypeScript types for component props
interface UserListProps {
  className?: string;
}

interface NewUserForm {
  name: string;
  email: string;
}

export function UserList({ className = '' }: UserListProps) {
  const dispatch = useAppDispatch();
  const { users, loading, error, selectedUser } = useAppSelector((state) => state.users);
  
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>({ name: '', email: '' });

  // Load users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleCreateUser = () => {
    const { name, email } = newUser;
    if (name?.trim() && email?.trim()) {
      const userData = { name: name.trim(), email: email.trim() };
      dispatch(createUser(userData));
      setNewUser({ name: '', email: '' });
      setShowForm(false);
    }
  };

  const handleUpdateUser = () => {
    if (editingUser?.id != null && editingUser.id !== '') {
      const updates: Partial<User> = {};
      const trimmedName = editingUser.name?.trim();
      const trimmedEmail = editingUser.email?.trim();
      
      if (trimmedName != null && trimmedName !== '') {
        updates.name = trimmedName;
      }
      if (trimmedEmail != null && trimmedEmail !== '') {
        updates.email = trimmedEmail;
      }
      if (Object.keys(updates).length > 0) {
        dispatch(updateUser({ id: editingUser.id, updates }));
        setEditingUser(null);
      }
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  const handleSelectUser = (user: User) => {
    dispatch(fetchUserById(user.id));
  };

  const handleError = () => {
    dispatch(clearError());
  };

  return (
    <div className={`user-list ${className}`}>
      <div className="user-list__header">
        <h2>Users Management</h2>
        <div className="user-list__actions">
          <button
            type="button"
            onClick={() => dispatch(fetchUsers())}
            disabled={loading}
            className="btn btn--primary"
          >
            {loading ? 'Loading...' : 'Refresh Users'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn btn--success"
          >
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>
      </div>

      {error != null && error !== '' && (
        <div className="user-list__error">
          <p>Error: {error}</p>
          <button type="button" onClick={handleError} className="btn btn--small">
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <div className="user-list__form">
          <h3>Create New User</h3>
          <div className="form-group">
            <label htmlFor="user-name">Name:</label>
            <input
              type="text"
              id="user-name"
              value={newUser.name}
              onInput={(e) =>
                setNewUser({ ...newUser, name: e.currentTarget.value })
              }
              placeholder="Enter user name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="user-email">Email:</label>
            <input
              type="email"
              id="user-email"
              value={newUser.email}
              onInput={(e) =>
                setNewUser({ ...newUser, email: e.currentTarget.value })
              }
              placeholder="Enter user email"
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCreateUser}
              className="btn btn--success"
              disabled={!newUser.name?.trim() || !newUser.email?.trim()}
            >
              Create User
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn--secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="user-list__content">
        <div className="user-list__users">
          <h3>Users ({users.length})</h3>
          {users.length === 0 ? (
            <p>No users found. Create your first user!</p>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  className={selectedUser?.id === user.id ? 'user-card--selected' : ''}
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="btn btn--small btn--info"
                      >
                        Select
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        className="btn btn--small btn--warning"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn btn--small btn--danger"
                      >
                        Delete
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="user-list__details">
            <h3>Selected User Details</h3>
            <div className="user-details">
              <div className="user-details__field">
                <strong>ID:</strong> {selectedUser.id}
              </div>
              <div className="user-details__field">
                <strong>Name:</strong> {selectedUser.name}
              </div>
              <div className="user-details__field">
                <strong>Email:</strong> {selectedUser.email}
              </div>
            </div>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="user-list__edit">
          <h3>Edit User</h3>
          <div className="form-group">
            <label htmlFor="edit-name">Name:</label>
            <input
              type="text"
              id="edit-name"
              value={editingUser.name}
              onInput={(e) =>
                setEditingUser({ ...editingUser, name: e.currentTarget.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-email">Email:</label>
            <input
              type="email"
              id="edit-email"
              value={editingUser.email}
              onInput={(e) =>
                setEditingUser({ ...editingUser, email: e.currentTarget.value })
              }
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={handleUpdateUser}
              className="btn btn--success"
              disabled={!editingUser.name?.trim() || !editingUser.email?.trim()}
            >
              Update User
            </button>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="btn btn--secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;