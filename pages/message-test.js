import React from 'react';
import axios from 'axios'
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../controller/firebase'

const ChatMessages = () => {

    // Testing sendMessage function
    const sendMessage = async() => {
        const url = 'https://basepay-api.onrender.com/send-message'
        const data = {
            chatroomId : "5uC30L8CqDYj4VivMuqn",
            currentUserAddress : "0xAB60DdFE027D9D86C836e8e5f9133578E102F720",
            message_content : "Good"
        }
        const response = await axios.post(url,data)
        console.log(response)
    }

    // ------------------------------ Please improvise and reuse this part ------------------------------ //
    // make the second param dynamic. Hardcoded a chatroom ID for testing
    const privateChatRef = collection(db, "PrivateChatRooms", "5uC30L8CqDYj4VivMuqn", "Messages")
    // sort messages by timestamp. Latest appears as last
    const q = query(privateChatRef, orderBy('timestamp'))

    // hook to listen to firestore
    const [value, loading, error] = useCollection(q);

    // data structure of value.docs.data()
    /*
    {"timestamp":{"seconds":1692412626,"nanoseconds":21000000},
    "from":"0x6724A71f5689c51138F2f213E3Bbb00Ffe320A28",
    "text_content":"Hello World",
    "to":"0xAB60DdFE027D9D86C836e8e5f9133578E102F720"}
    */

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
