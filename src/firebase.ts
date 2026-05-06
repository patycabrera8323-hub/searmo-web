import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAALhyzdXrwvmj-W_6NWNemjxrXerpL8M",
  authDomain: "bot-yeiya.firebaseapp.com",
  projectId: "bot-yeiya",
  storageBucket: "bot-yeiya.firebasestorage.app",
  messagingSenderId: "96981785436",
  appId: "1:96981785436:web:162872706cd8ee76ccbf99"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
