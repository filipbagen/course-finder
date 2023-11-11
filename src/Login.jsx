import React, { useEffect, useState } from 'react';
import {
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

const Login = () => {
  const [val, setVal] = useState({
    email: '',
    password: '',
  });

  const [loader, setLoader] = useState({
    microsoftLoading: false,
    emailLoading: false,
  });

  const [error, setError] = useState({
    message: '',
    open: false,
  });

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        // Handle the result
      })
      .catch((error) => {
        setError({ message: error.message, open: true });
      });
  }, []);

  const handleMicrosoftLogin = () => {
    setLoader({ ...loader, microsoftLoading: true });
    const provider = new OAuthProvider('microsoft.com');
    signInWithRedirect(auth, provider).catch((error) => {
      setError({ message: error.message, open: true });
      setLoader({ ...loader, microsoftLoading: false });
    });
  };

  const handleEmailPasswordLogin = (e) => {
    e.preventDefault(); // Prevent the default form submission
    setLoader({ ...loader, emailLoading: true });

    signInWithEmailAndPassword(auth, val.email, val.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ... (handle sign-in success)
      })
      .catch((error) => {
        setError({ message: error.message, open: true });
      })
      .finally(() => {
        setLoader({ ...loader, emailLoading: false });
      });
  };

  return (
    <div>
      <h1>Login</h1>
      {error.open && <h1 style={{ color: 'red' }}>{error.message}</h1>}

      {/* Microsoft Login */}
      <button onClick={handleMicrosoftLogin} disabled={loader.microsoftLoading}>
        {loader.microsoftLoading ? 'Loading...' : 'Sign in with Microsoft'}
      </button>

      {/* Email and Password Login Form */}
      <form onSubmit={handleEmailPasswordLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={val.email}
            onChange={(e) => setVal({ ...val, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={val.password}
            onChange={(e) => setVal({ ...val, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" disabled={loader.emailLoading}>
          {loader.emailLoading ? 'Loading...' : 'Sign in with Email'}
        </button>
      </form>
    </div>
  );
};

export default Login;
