// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCG-pLqzp1vkNbPSx2NtTV3MMGSelRyAFI",
  authDomain: "imageupload-d5dc9.firebaseapp.com",
  projectId: "imageupload-d5dc9",
  storageBucket: "imageupload-d5dc9.appspot.com",
  messagingSenderId: "1045651528177",
  appId: "1:1045651528177:web:0bb621d36ef69c383e4c50",
  measurementId: "G-F0XFN0HNBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);