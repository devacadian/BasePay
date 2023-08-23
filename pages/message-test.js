import React from 'react';
import axios from 'axios'
import { collection, query, orderBy, getDoc } from "firebase/firestore";
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

    const sendPaymentRequest= async() => {
        const url = 'https://basepay-api.onrender.com/send-paymentRequest-message'
        const data = {
            chatroomId : "CGieudoeTGi3fK0vVDgq",
            currentUserAddress : "0x6724A71f5689c51138F2f213E3Bbb00Ffe320A28",
            ether_amount : "0.007788",
            transaction_message : "payment request initiated in React!!"
        }
        const response = await axios.post(url,data)
        console.log(response)
    }

    // ------------------------------ Please improvise and reuse this part ------------------------------ //
    // make the second param dynamic. Hardcoded a chatroom ID for testing
    const privateChatRef = collection(db, "PrivateChatRooms", "CGieudoeTGi3fK0vVDgq", "Messages")
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

    or

    {"timestamp":{"seconds":1692412626,"nanoseconds":21000000},
    "from":"0x6724A71f5689c51138F2f213E3Bbb00Ffe320A28",
    "payment_request_message":PaymentRequests/H2ZipK4EGRW3SP1Q7Xkq,  <--- reference type document
    "to":"0xAB60DdFE027D9D86C836e8e5f9133578E102F720"}

    */

    return (
        <div className="flex flex-col items-center  h-screen bg-white px-4  p-20">
            <div className="bg-base-blue text-white font-medium w-full py-2 mx-1 mb-4 flex flex-col text-left p-10">
                {error && <strong>Error: {JSON.stringify(error)}</strong>}
                {loading && <span>Collection: Loading...</span>}
                {value && value.docs.map((doc) => {
  const textOrRequest = doc.data().payment_request_message ? "request" : "text";

  if (textOrRequest === 'text') {
    return (
      <div key={doc.id}> {/* Add key prop here */}
        <>{JSON.stringify(doc.data().from)}</>
        <>{JSON.stringify(doc.data().text_content)}</>
      </div>
    );
  } else if (textOrRequest === "request") {
    const requestRef = doc.data().payment_request_message;
    // getDoc(requestRef)
    axios.post('https://basepay-api.onrender.com/get-paymentRequset-byRef', { referenceDocRef: requestRef })
      .then((referenceDocData) => {
        return (
          <div key={doc.id}> {/* Add key prop here */}
            {JSON.stringify(doc.data().from)}
            {JSON.stringify(referenceDocData.ether_amount)}
            {JSON.stringify(referenceDocData.transaction_message)}
          </div>
        );
      });
  }
})}
            </div>

            <button onClick={sendMessage} className="bg-base-blue text-white font-medium rounded-full w-full py-2 mx-1 flex items-center justify-center m-10" >
            Send Message
            </button>

            <button onClick={sendPaymentRequest} className="bg-base-blue text-white font-medium rounded-full w-full py-2 mx-1 flex items-center justify-center">
            Send Payment Request
            </button>
        </div>
    );
};

export default ChatMessages;




/*
{value && value.docs.map((doc) => (
                    <div key={doc.id} className="mb-2">
                        {doc.data().payment_request_message}
                        {JSON.stringify(doc.data().from)}
                        {JSON.stringify(doc.data().text_content)}
                    </div>
                ))}
*/
