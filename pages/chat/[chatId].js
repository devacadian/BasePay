import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

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

// initialize firestore connection
import { getFirestore, collectionGroup, collection, orderBy, query, where, addDoc, getDocs } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
const db = getFirestore(app)

const App = () => {
    const router = useRouter()
    const { chatId } = router.query

    return (
    <main className="flex flex-col min-h-screen p-0 bg-white">
      <Head>
        <title>Profile - BasePay - Chat</title>
        {/* Add other meta tags as needed */}
      </Head>
      <div className="flex-grow flex items-center justify-center">
        <DisplayChatHistory props={chatId}/>
      </div>
    </main>
  );
};

async function DisplayChatHistory(chatId) {
    const PrivateChatRoomsMessagesRef = collection(db, `PrivateChatRooms`)
    const q = query(PrivateChatRoomsMessagesRef, where('type', "==", 'Messages'))
    
    const querySnapshot = await getDocs(
        query(
            collection(`PrivateChatRooms/5uC30L8CqDYj4VivMuqn/Messages`)
        )
    )
    querySnapshot.forEach((queryDocumentSnapshot) => {
        console.log(
          queryDocumentSnapshot.id,
          queryDocumentSnapshot.data()
        )
      })

    const [value, loading, error] = useCollection(q);

    return(
        <>
            {error && <strong className="text-red-600">Error: {JSON.stringify(error)}</strong>}
            {loading && <span className="text-blue-600">Collection: Loading...</span>}
            {value ? value.docs.map((doc, index) => (
                        <React.Fragment key={doc.id}>
                            <div className="mb-2">
                                {JSON.stringify(doc.data())}
                            </div>
                            {index < value.docs.length - 1 && ", "}
                        </React.Fragment>
                    )): null}
        </>
    )
}



export default App;