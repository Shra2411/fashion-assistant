// src/auth.js
import { auth, provider } from './firebase';
import {
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export const registerWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

// Listen for auth state changes (login/logout)
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};
