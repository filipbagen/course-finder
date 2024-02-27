import { useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as signOutFromFirebase,
} from 'firebase/auth';

export function useAuth() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const user = useContext(AuthContext);

  const createAccount = async () => {
    try {
      await createUserWithEmailAndPassword(
        auth,
        emailRef.current!.value,
        passwordRef.current!.value
      );
    } catch (error) {
      console.error(error);
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        emailRef.current!.value,
        passwordRef.current!.value
      );
    } catch (error) {
      console.error(error);
    }
  };

  const signOut = async () => {
    try {
      await signOutFromFirebase(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    user,
    emailRef,
    passwordRef,
    createAccount,
    signIn,
    signOut,
  };
}
