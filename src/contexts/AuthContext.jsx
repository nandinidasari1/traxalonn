// import React, { createContext, useContext, useEffect, useState } from "react";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
//   sendPasswordResetEmail,
//   sendEmailVerification,
// } from "firebase/auth";
// import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
// import { auth, db } from "../firebase/config";

// const AuthContext = createContext();

// export function useAuth() {
//   return useContext(AuthContext);
// }

// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [userProfile, setUserProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   async function signup(email, password, displayName, badgeId, department) {
//   const { user } = await createUserWithEmailAndPassword(auth, email, password);
//   const userRef = doc(db, "users", user.uid);
//   const existing = await getDoc(userRef);
//   if (!existing.exists()) {
//     await setDoc(userRef, {
//       uid: user.uid,
//       email,
//       displayName,
//       badgeId,
//       department,
//       credits: 1,
//       role: "officer",
//       createdAt: serverTimestamp(),
//       lastSeen: serverTimestamp(),
//       totalLinksGenerated: 0,
//     });
//   }
//   await signOut(auth);
//   return user;
// }

//   async function login(email, password) {
//     const result = await signInWithEmailAndPassword(auth, email, password);

//     // Force refresh user to get latest verification state
//     await result.user.reload();
//     const freshUser = auth.currentUser;

//     if (!freshUser.emailVerified) {
//       await signOut(auth);
//       throw new Error("Email not verified");
//     }

//     await setDoc(doc(db, "users", freshUser.uid), {
//       lastSeen: serverTimestamp(),
//       emailVerified: true,
//     }, { merge: true });

//     setCurrentUser(freshUser); // 🔥 important
//     await fetchUserProfile(freshUser.uid);

//     return freshUser;
//   }

//   async function logout() {
//     if (currentUser) {
//       await updateDoc(doc(db, "users", currentUser.uid), {
//         lastSeen: null,
//       });
//     }
//     setUserProfile(null);
//     return signOut(auth);
//   }

//   async function resetPassword(email) {
//     return sendPasswordResetEmail(auth, email);
//   }

//   async function resendVerification(email, password) {
//     try {
//       // Temporarily sign in user
//       const result = await signInWithEmailAndPassword(auth, email, password);

//       await sendEmailVerification(result.user);

//       // Immediately log out again
//       await signOut(auth);

//     } catch (error) {
//       throw error;
//     }
//   }

//   async function fetchUserProfile(uid) {
//     const docRef = doc(db, "users", uid);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       setUserProfile(docSnap.data());
//       return docSnap.data();
//     }
//     return null;
//   }

//   useEffect(() => {
//     let interval = null;
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         await user.reload();
//         const freshUser = auth.currentUser;

//         setCurrentUser(freshUser);
//         await fetchUserProfile(freshUser.uid);

//         await setDoc(doc(db, "users", freshUser.uid), {
//           lastSeen: serverTimestamp(),
//           emailVerified: freshUser.emailVerified,
//         }, { merge: true });

//         if (interval) clearInterval(interval);
//         interval = setInterval(async () => {
//           try {
//             await setDoc(doc(db, "users", freshUser.uid), {
//               lastSeen: serverTimestamp(),
//             }, { merge: true });
//           } catch (e) { }
//         }, 2 * 60 * 1000);
//       } else {
//         setCurrentUser(null);
//         if (interval) clearInterval(interval);
//       }
//       setLoading(false);
//     });
//     return () => {
//       unsubscribe();
//       if (interval) clearInterval(interval);
//     };
//   }, []);

//   const isAuthenticated = !!currentUser;

//   const value = {
//     currentUser,
//     userProfile,
//     isAuthenticated,
//     signup,
//     login,
//     logout,
//     resetPassword,
//     resendVerification,
//     fetchUserProfile,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp,
  collection, addDoc, query, where, 
  orderBy, limit, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName, badgeId, department) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      badgeId,
      department,
      credits: 1,
      role: "officer",
      createdAt: serverTimestamp(),
      totalLinksGenerated: 0,
    });
    await signOut(auth); 
    return user;
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await result.user.reload();
    const freshUser = auth.currentUser;

    await setDoc(doc(db, "users", freshUser.uid), {
      lastSeen: serverTimestamp(),
      isOnline: true
    }, { merge: true });

    // ✅ Log every login as a new session
  await addDoc(collection(db, "users", freshUser.uid, "sessions"), {
    loginAt: serverTimestamp(),
    logoutAt: null,
    type: "login",
  });

    setCurrentUser(freshUser);
    await fetchUserProfile(freshUser.uid);
    return freshUser;
  }

  async function logout() {
    if (currentUser) {
    // ✅ Find the latest open session and close it
    const sessionsRef = collection(db, "users", currentUser.uid, "sessions");
    const q = query(
      sessionsRef,
      where("logoutAt", "==", null),
      orderBy("loginAt", "desc"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, {
        logoutAt: serverTimestamp(),
      });
    }

    // Update user doc
    await setDoc(doc(db, "users", currentUser.uid), {
      isOnline: false,
    }, { merge: true });
  }
    setUserProfile(null);
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function confirmReset(oobCode, newPassword) {
    return confirmPasswordReset(auth, oobCode, newPassword);
  }

  async function fetchUserProfile(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data());
      return docSnap.data();
    }
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await user.reload();
          const freshUser = auth.currentUser;
          setCurrentUser(freshUser);
          await fetchUserProfile(freshUser.uid);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth context error:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAuthenticated: !!currentUser,
    signup,
    login,
    logout,
    resetPassword,
    confirmReset,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}