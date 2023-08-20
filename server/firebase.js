require('dotenv').config()
const { initializeApp } = require('firebase/app') 
const { getFirestore } = require("firebase/firestore")

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
};
// initialize firebase conncetion
const app = initializeApp(firebaseConfig);
// initialize firestore conncetion
const db = getFirestore(app);

// export firebase and firestore instance
module.exports = {app,db}