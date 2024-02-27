import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';

function Signup() {
  const { user, emailRef, passwordRef, createAccount, signIn, signOut } =
    useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
    try {
      await createAccount();
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message);
      console.log(e.message);
    }

    return (
      <div className="max-w-[700px] mx-auto my-16 p-4">
        <div>
          <h1 className="text-2xl font-bold py-2">
            Sign up for a free account
          </h1>
          <p className="py-2">
            Don't have an account yet?{' '}
            <Link to="/" className="underline">
              Sign in
            </Link>
          </p>
        </div>
        <div>
          <h1>Firebase Authentication</h1>
          {user && <Button onClick={signOut}>Sign Out</Button>}
          {!user ? (
            <div style={{ maxWidth: '500px' }}>
              <div>
                <label>Email</label>
                <input ref={emailRef} type="email" placeholder="email" />
              </div>
              <div>
                <label>Password</label>
                <input
                  ref={passwordRef}
                  type="password"
                  placeholder="password"
                />
              </div>
              <div>
                <Button onClick={handleSubmit}>Sign Up</Button>
                {/* <button>Sign In</button> */}
              </div>
            </div>
          ) : (
            <div>Welcome {user?.email}</div>
          )}
        </div>
      </div>
    );
  };
}

export default Signup;
