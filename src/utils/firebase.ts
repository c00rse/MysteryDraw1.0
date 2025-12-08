import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBerUg7xCPWdzi5TF0OGqpyy-OTWs5Blck",
  authDomain: "mysterydraw-d2a0f.firebaseapp.com",
  projectId: "mysterydraw-d2a0f",
  storageBucket: "mysterydraw-d2a0f.firebasestorage.app",
  messagingSenderId: "513449856581",
  appId: "1:513449856581:web:9c386514d3567dae24dd2c",
};

const app = initializeApp(firebaseConfig);

// Eksportujemy instancje usług, aby używać ich w całej aplikacji
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();