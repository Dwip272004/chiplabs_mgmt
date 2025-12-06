import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // firebase user + profile
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, profile = {}) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;

    // Create user doc in Firestore with profile and default role = employee
    const userDoc = {
      uid,
      email,
      role: profile.role || "employee",
      profile: {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        ...profile
      },
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, "users", uid), userDoc);
    return res;
  };

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // read user profile from firestore
        try {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          const userData = userSnap.exists() ? userSnap.data() : null;
          setCurrentUser({ uid: user.uid, email: user.email, ...userData });
          setUserRole(userData?.role || null);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          setCurrentUser({ uid: user.uid, email: user.email });
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    register,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
