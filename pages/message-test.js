
import React from 'react';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios'
import { useCollection } from 'react-firebase-hooks/firestore';
// initialize connection to firebase and firestore
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, orderBy } from "firebase/firestore"

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
};
// initialize firebase conncetion
const app = initializeApp(firebaseConfig);
// initialize firestore conncetion
const db = getFirestore(app);



// create a function to listen to the Messages collection of a particular chatroom

const ChatMessages = () => {

    const sendMessage = async() => {
        const url = 'https://basepay-api.onrender.com/send-message'
        const data = {
            chatroomId : "5uC30L8CqDYj4VivMuqn",
            currentUserAddress : "0xAB60DdFE027D9D86C836e8e5f9133578E102F720",
            message_content : "Test Message send from react"
        }
        
        const response = await axios.post(url,data)
        console.log(response)
    }

    const privateChatRef = collection(db, "PrivateChatRooms", "5uC30L8CqDYj4VivMuqn", "Messages")
    const q = query(privateChatRef, orderBy('timestamp'))

    const [value, loading, error] = useCollection(q);

    return (
        <div className="flex flex-col items-center  h-screen bg-white px-4  p-20">
            <div className="bg-base-blue text-white font-medium w-full py-2 mx-1 mb-4 flex flex-col text-left p-10">
                {error && <strong>Error: {JSON.stringify(error)}</strong>}
                {loading && <span>Collection: Loading...</span>}
                {value && value.docs.map((doc) => (
                    <div key={doc.id} className="mb-2">
                        {JSON.stringify(doc.data().from)}
                        {JSON.stringify(doc.data().text_content)}
                    </div>
                ))}
            </div>

            <button onClick={sendMessage} className="bg-base-blue text-white font-medium rounded-full w-full py-2 mx-1 flex items-center justify-center">
            Send Message
            </button>
        </div>
    );
};

export default ChatMessages;
