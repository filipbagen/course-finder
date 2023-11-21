import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// components
import MainLayout from './MainLayout';

const Profile = () => {
  const [error, setError] = useState();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setError('');

    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
    }
  }

  return (
    <MainLayout>
      <h1>Profile</h1>
      {error && <Alert variant="error">{error}</Alert>}
      <strong>Email: </strong> {currentUser.email}
      <Link
        to="/update-profile"
        style={{
          display: 'block',
          width: '100%',
          marginTop: '10px',
          padding: '10px',
          backgroundColor: 'blue',
          color: 'white',
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: '5px',
        }}
      >
        Update profile
      </Link>
      <div className="w-100 text-center mt-2">
        <button onClick={handleLogout}>Log Out</button>
      </div>
    </MainLayout>
  );
};

export default Profile;
