import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth'
import { auth } from './firebase'
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password)
export const logout = () => signOut(auth)
export const changePassword = (password) => updatePassword(auth.currentUser, password)
