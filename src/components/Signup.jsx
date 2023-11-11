import React, { useRef, useState } from 'react';
import 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';

import { db } from '../firebase';

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      const userCredential = await signup(
        emailRef.current.value,
        passwordRef.current.value
      );
      const user = userCredential.user;

      // Now you have the user, you can use their UID to create a document in Firestore
      await db.collection('users').doc(user.uid).set({
        email: emailRef.current.value,
      });
      console.log('New document created');

      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Failed to create an account');
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Sign Up</h2>

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
          <input type="email" ref={emailRef} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Password</label>
          <input
            type="password"
            ref={passwordRef}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label>Password Confirmation</label>
          <input
            type="password"
            ref={passwordConfirmRef}
            required
            style={inputStyle}
          />
        </div>

        <button disabled={loading} style={submitButtonStyle} type="submit">
          Sign Up
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  margin: '6px 0px',
  display: 'inline-block',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const submitButtonStyle = {
  width: '100%',
  backgroundColor: '#007bff',
  color: 'white',
  padding: '14px 20px',
  margin: '8px 0',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};
