// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8IIPn0YrxtslaxcavDY3hVni5voAhIg4",
  authDomain: "m-trak.firebaseapp.com",
  projectId: "m-trak",
  storageBucket: "m-trak.firebasestorage.app",
  messagingSenderId: "282688429721",
  appId: "1:282688429721:web:85726f99c0eac3f2c16208",
  measurementId: "G-HR1P2G10S7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);