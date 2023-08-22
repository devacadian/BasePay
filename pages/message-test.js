import React, { useState } from 'react';
import Modal from 'react-modal';
import Head from 'next/head';
import dotenv from 'dotenv';
import { useRouter } from 'next/router';

// Load environment variables from .env file
dotenv.config();

// initialize firebase auth connection//
import {FirebaseApp, initializeApp} from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APPID
}
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
import { useAuthState } from 'react-firebase-hooks/auth';

// initialize firestore connection
import { getFirestore, collection, query, where, addDoc } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
const db = getFirestore(app)

const App = () => {

    // hook to keep track of if a user is logged in or not
    const [user] = useAuthState(auth);
    return (
    <main className="flex flex-col min-h-screen p-0 bg-white">
        <Head>
            <title>Profile - BasePay Test</title>
            {/* Add other meta tags as needed */}
        </Head>
        <header>
            <SignOut/>
        </header>
        <div className="flex-grow flex items-center justify-center">
            {user? <ChatRoomList/> : <SignIn/>}
            {user? <CreatChatRoom/> : null }
        </div>
    </main>
  );
};

function SignIn() {
    const provider = new GoogleAuthProvider
    const signInWithGoogle = () => {
        signInWithPopup(auth, provider)    
    }
    return (
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md" onClick={signInWithGoogle}>Sign-in</button>
    )
}

function SignOut() {
    return auth.currentUser && (
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md" onClick={() => auth.signOut()}>Sign Out</button>
      )
}

// This componet will render all privateChatRoom document that the currentUser joined
function ChatRoomList() {
    const router = useRouter()
    const currentUser = auth.currentUser.uid
    const privateChatRef = collection(db, "PrivateChatRooms")
    const q = query(privateChatRef, where("participants", "array-contains", currentUser))

    const [value, loading, error] = useCollection(q);

    return (
        <>
            {error && <strong className="text-red-600">Error: {JSON.stringify(error)}</strong>}
            {loading && <span className="text-blue-600">Collection: Loading...</span>}
            {value && (
                <div className="p-4 rounded-lg bg-gray-100 my-4">
                    <strong className="text-black">Chats:</strong>
                    {value.docs.map((doc, index) => (
                        <React.Fragment key={doc.id}>
                            <div className="mb-2">
                                <button
                                className="text-blue-600 hover:underline"
                                onClick={() => {
                                    // Handle the button click action here, e.g., navigate to a chat room.
                                    console.log(`Clicked on document ${doc.id}`);
                                    router.push(`/chat/${doc.id}`);
                                }}
                                >
                                {`Chat with ${JSON.parse(JSON.stringify(doc.data())).participants[0]} `}
                                </button>
                            </div>
                            {index < value.docs.length - 1 && ", "}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </>
  );
}

function CreatChatRoom() {
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uidInput, setUidInput] = useState('');
    
    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const createChat = async() => {
        const chatroomRef = collection(db,'PrivateChatRooms');
        const chatroomData = {
            participants: [auth.currentUser.uid, uidInput],
        };

        try {
            const newDocRef = await addDoc(chatroomRef,chatroomData)
            console.log('Document written with ID: ', newDocRef.id);
            closeModal()
        }
        catch(error) {
            console.log(error.message)
        }
    
    }
    
    return (
        <div>
      <button
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md"
        onClick={openModal}
      >
        New Chat
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Create Chat Modal"
      >
        <h2>Create a New Chat</h2>
        <input
          type="text"
          placeholder="Who do you want to chat with?"
          value={uidInput}
          onChange={(e) => setUidInput(e.target.value)}
          className="text-black"
        />
        <button
        onClick={createChat}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md mr-2"
      >
        Create Chat
      </button>
      <button
        onClick={closeModal}
        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md"
      >
        Close
      </button>
      </Modal>
    </div>
    )
}

function sendMessage() {

}


export default App;