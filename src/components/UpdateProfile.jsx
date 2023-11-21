import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function UpdateProfile() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { currentUser, updateEmail, updatePassword } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    const promises = [];
    setLoading(true);
    setError('');

    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value));
    }

    if (passwordRef.current.value) {
      console.log('hi2');
      promises.push(updatePassword(passwordRef.current.value));
    }

    Promise.all(promises)
      .then(() => {
        navigate('/');
      })
      .catch(() => {
        setError('Failed to update account');
      })
      .finally(() => {
        setLoading(false);
      });

    console.log('hi3');
  }

  return (
    <>
      <div
        style={{
          margin: 'auto',
          width: '300px',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ textAlign: 'center' }}>Update Profile</h2>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Email</label>
              <input
                type="email"
                ref={emailRef}
                required
                defaultValue={currentUser.email}
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Password</label>
              <input
                type="password"
                ref={passwordRef}
                placeholder="Leave blank to keep the same"
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Password Confirmation</label>
              <input
                type="password"
                ref={passwordConfirmRef}
                placeholder="Leave blank to keep the same"
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <button
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'blue',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
              }}
              type="submit"
            >
              Update
            </button>
          </form>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Link to="/profile">Cancel</Link>
      </div>
    </>
  );
}
