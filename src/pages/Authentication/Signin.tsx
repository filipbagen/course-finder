import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';

function Signin() {
  const { user, emailRef, passwordRef, createAccount, signIn, signOut } =
    useAuth();

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
    try {
      await signIn();
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message);
      console.log(e.message);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto my-16 p-4">
      <div>
        <h1 className="text-2xl font-bold py-2">Sign in to your account</h1>
        <p className="py-2">
          Don't have an account yet?{' '}
          <Link to="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </div>
      <form>
        <div className="flex flex-col py-2">
          <label className="py-2 font-medium">Email Address</label>
          <input ref={emailRef} className="border p-3" type="email" />
        </div>
        <div className="flex flex-col py-2">
          <label className="py-2 font-medium">Password</label>
          <input ref={passwordRef} className="border p-3" type="password" />
        </div>
        <Button onClick={handleSubmit}>Sign in</Button>
      </form>
    </div>
  );
}

export default Signin;
