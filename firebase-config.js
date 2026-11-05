// Firebase Configuration for Aryan & Simmu's Live Love Tracker
const firebaseConfig = {
  apiKey: "AIzaSyBrR9JNxy-y8-6HJZCpkHNM-4bbevcWyDE",
  authDomain: "proposal-site-a3d05.firebaseapp.com",
  projectId: "proposal-site-a3d05",
  storageBucket: "proposal-site-a3d05.firebasestorage.app",
  messagingSenderId: "243759471874",
  appId: "1:243759471874:web:d9f3e7a53b90e81a57761b",
  measurementId: "G-N907KGVF8L"
};

// Initialize Firebase if not already initialized
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
