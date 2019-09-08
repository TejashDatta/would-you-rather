import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

var firebaseConfig = {
  apiKey: "AIzaSyCCgbWGcxftzyaO96j9sQy-h2fOncX7Ncc",
  authDomain: "would-you-rather-69ad5.firebaseapp.com",
  databaseURL: "https://would-you-rather-69ad5.firebaseio.com",
  projectId: "would-you-rather-69ad5",
  storageBucket: "would-you-rather-69ad5.appspot.com",
  messagingSenderId: "845239078553",
  appId: "1:845239078553:web:486ba2b372a30150",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const auth = firebase.auth();

export default firebase;
