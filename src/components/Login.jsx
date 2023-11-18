import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch {
      setError('Failed to log in');
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <div style={{ width: '400px', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Log In</h2>
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
        <form onSubmit={handleSubmit}>
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

          <div style={{ marginBottom: '16px' }}>
            <label>Password</label>
            <input
              type="password"
              ref={passwordRef}
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
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '14px 20px',
              margin: '8px 0',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'default' : 'pointer',
            }}
            type="submit"
          >
            Log In
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}
