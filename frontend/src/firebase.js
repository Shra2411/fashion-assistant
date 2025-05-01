// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyA0h2Zp48ysTKGNorlno023zlrbYKfrG_w",
    authDomain: "clothx-e1ace.firebaseapp.com",
    projectId: "clothx-e1ace",
    storageBucket: "clothx-e1ace.firebasestorage.app",
    messagingSenderId: "876974561224",
    appId: "1:876974561224:web:7360de8e2225106b3892fd",
    measurementId: "G-K46ZRNHFBN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);
export { auth, provider };
