import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Check your inbox for further instructions');
    } catch {
      setError('Failed to reset password');
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>
        Password Reset
      </h2>
      {error && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '5px',
          }}
        >
          {error}
        </div>
      )}
      {message && (
        <div
          style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px',
            borderRadius: '5px',
          }}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
        <div style={{ marginBottom: '16px' }}>
          <label>Email</label>
          <input
            type="email"
            ref={emailRef}
            required
            style={{
              width: '100%',
              padding: '10px',
              margin: '6px 0px',
              display: 'inline-block',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#007bff',
            color: 'white',
            padding: '14px 20px',
            margin: '8px 0',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'default' : 'pointer',
          }}
          type="submit"
        >
          Reset Password
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <Link to="/login">Log In</Link>
      </div>
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}
