// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTbls2JdkH2giBzyvuVkZvq9vJqnPtLlQ",
  authDomain: "kangyoo-shoes.firebaseapp.com",
  projectId: "kangyoo-shoes",
  storageBucket: "kangyoo-shoes.appspot.com",
  messagingSenderId: "1044426477678",
  appId: "1:1044426477678:web:abfbda2f8622e9b434967f",
  measurementId: "G-J0SQML0H5X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);