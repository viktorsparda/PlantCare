// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
   apiKey: "AIzaSyCkRKTeYiE3KTNHV-NIy73JQgV17Q9KIXA",
  authDomain: "plantcare-b4358.firebaseapp.com",
  projectId: "plantcare-b4358",
  storageBucket: "plantcare-b4358.firebasestorage.app",
  messagingSenderId: "303332990090",
  appId: "1:303332990090:web:c95857540454056e566173"
};

// Inicializar Firebase solo una vez
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
