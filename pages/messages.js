import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessagePen, faMagnifyingGlass, faArrowLeft, faSpinner, faMessages, faXmark, faCopy, faUpRightFromSquare, faPaperPlaneTop } from '@fortawesome/pro-solid-svg-icons';
import QRCode from 'qrcode.react'; 
import { useAccount } from "wagmi";
import createIcon from 'blockies';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../controller/firebase'; // Make sure to import your Firebase db configuration
import axios from 'axios'


export default function Messages() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(router.query.newmessage === 'true');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { address } = useAccount();
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoadingChatRooms, setIsLoadingChatRooms] = useState(false);
  const [showChatRoomModal, setShowChatRoomModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [selectedChatRoomName, setSelectedChatRoomName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [isLoadingChatMessages, setIsLoadingChatMessages] = useState(false);

  
  // Create a ref for the query
  const queryRef = useRef(null);

  // Update the query ref whenever selectedChatRoomId changes
  useEffect(() => {
    if (selectedChatRoomId) {
      setIsLoadingChatMessages(true);
      const privateChatRef = collection(db, "PrivateChatRooms", selectedChatRoomId, "Messages");
      const q = query(privateChatRef, orderBy('timestamp'));
  
      // Subscribe to changes and update the state
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setChatMessages(snapshot.docs.map(doc => doc.data()));
        setIsLoadingChatMessages(false);
      });
  
      // Return the unsubscribe function to clean up the subscription
      return () => unsubscribe();
    }
  }, [selectedChatRoomId]);

  // Use the useCollection hook to listen to Firestore
  const [value, loading, error] = useCollection(queryRef.current);


  useEffect(() => {
    if (address) {
      // Function to fetch available chat rooms
      const fetchChatRooms = async () => {
        setIsLoadingChatRooms(true); // Set loading state to true before fetching

        try {
          // Use the address from useAccount as the connected wallet
          const response = await fetch(`https://basepay-api.onrender.com/get-private-chatroom/${address}`);
          const data = await response.json();
          setChatRooms(data);
        } catch (error) {
          console.error('Error fetching chat rooms:', error);
        }

        setIsLoadingChatRooms(false); // Set loading state to false after fetching
      };

      fetchChatRooms();
    }
  }, [address]); // Will run when address changes or refreshKey changes



  
  const openChatRoomModal = (chatRoomId, chatRoomName = null) => {
    if (!chatRoomName) {
      const chatRoom = chatRooms.find((room) => room.chatroomId === chatRoomId);
      chatRoomName = chatRoom ? chatRoom.chatWith : 'Unknown'; // Provide a fallback value if needed
    }
    setSelectedChatRoomName(chatRoomName);
    setSelectedChatRoomId(chatRoomId);
    console.log("Selected Chat Room ID:", chatRoomId); // Debug log
    setShowChatRoomModal(true);
  };
  
  
  const handleCloseChatRoomModal = () => {
    setShowChatRoomModal(false);
    setChatMessages([]); // Clear the chat messages
    setSelectedChatRoomId(null); // Reset the chat room ID
  };

  const handleCloseModal = () => {
    // Create a copy of the query object without the 'newmessage' key
    const { newmessage, ...newQuery } = router.query;
  
    // Replace the URL with the new query object
    router.replace({
      pathname: router.pathname,
      query: newQuery,
    });
    
    // Close the modal
    setShowModal(false);
  };

  const handleInviteModalClose = () => {
    setShowInviteModal(false);
  };


  const AvatarIcon = ({ seed }) => {
    const avatarRef = useRef(null);
  
    useEffect(() => {
      const icon = createIcon({
        seed: seed,
        color: '#000000', // Foreground color
        bgcolor: '#ffffff',
        size: 11,
        scale: 5  // Width/height of each block in pixels
      });
  
      if (avatarRef.current) {
        avatarRef.current.innerHTML = ''; // Clear previous children
        avatarRef.current.appendChild(icon);
      }
    }, [seed]);
    return <div ref={avatarRef} className="-ml-0.5"></div>;
  };

  const sendMessage = async () => {
    // Trim the message content and check if it's empty
    const trimmedMessageContent = messageContent.trim();
    if (trimmedMessageContent === '') {
      // If the message is empty or only contains whitespace, return without sendin
      return;
    }
  
    const url = 'https://basepay-api.onrender.com/send-message';
    const data = {
      chatroomId: selectedChatRoomId, // Using the selected chat room ID
      currentUserAddress: address, // Using the connected address
      message_content: trimmedMessageContent // Using the trimmed chatbox input
    };
    const response = await axios.post(url, data);
    console.log(response);
  
    setMessageContent(''); // Clear the chatbox input
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    setMessageContent(e.target.value);
  };

  // Function to create a private chat room
  const createPrivateChatRoom = async () => {
    const url = 'https://basepay-api.onrender.com/create-private-chatroom';
    const data = {
      "currentUserAddress": address,
      "secondUserAddress": searchAddress
    };
  
    const response = await axios.post(url, data);
    const chatRoomId = response.data; // Directly use the response data as the chat room ID
  
    // Assuming the response includes the chat room name or other necessary details
    const newChatRoom = { chatroomId: chatRoomId }; // Adjust as needed
  
    // Update the chat rooms array with the newly created chat room
    setChatRooms([...chatRooms, newChatRoom]);
  
    // Open the chat room modal with the new chat room ID
    openChatRoomModal(chatRoomId);
  };
  
  
  
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
    <div className="bg-white rounded-lg shadow-xl flex flex-col overflow-hidden" style={{ width: '500px', height: '812px' }}>
      <main className="flex flex-col bg-white overflow-y-auto flex-grow">
      <Head>
        {/* Other head content */}
      </Head>
      <div className="p-4 flex items-center justify-between">
      <div className="flex items-center">
          <h1 className="text-black text-3xl font-semibold pt-2 mr-1">Messages</h1>
          <FontAwesomeIcon icon={faMessages} className="h-6 w-6 text-black align-middle mt-3 ml-2" /> 
        </div>
        <button
          onClick={() => {
            // Handle the search action here
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="h-6 w-6 text-black align-middle mt-3" /> 
        </button>
      </div>


      {
  isLoadingChatRooms ? (
    <div className="flex justify-center mt-20">
      <FontAwesomeIcon icon={faSpinner} className="text-base-blue h-10 w-10 animate-spin" />
    </div>
  ) : chatRooms.length > 0 ? (
    chatRooms
    .sort((a, b) => {
      // Convert timestamps to milliseconds
      const timestampA = a.lastestMessageTimeStamp?.seconds * 1000 || 0;
      const timestampB = b.lastestMessageTimeStamp?.seconds * 1000 || 0;
      return timestampB - timestampA; // Sort in descending order
    })
    .map((chatRoom, index) => {
    const chatRoomTimestamp = chatRoom.lastestMessageTimeStamp?.seconds * 1000 || 0;
    const timeDifferenceMinutes = Math.floor((Date.now() - chatRoomTimestamp) / (1000 * 60));
    const truncatedChatWith = (chatRoom.chatWith || '').substring(0, 8) + "...";

    let chatRoomTimeString;
    if (timeDifferenceMinutes === 1) {
      chatRoomTimeString = `${timeDifferenceMinutes} min ago`;
    } else if (timeDifferenceMinutes < 60) {
      chatRoomTimeString = `${timeDifferenceMinutes} mins ago`;
    } else {
      const timeDifferenceHours = Math.floor(timeDifferenceMinutes / 60);
      chatRoomTimeString = timeDifferenceHours === 1
        ? `${timeDifferenceHours} hr ago`
        : `${timeDifferenceHours} hrs ago`;

      if (timeDifferenceMinutes >= 24 * 60) {
        const chatRoomDate = new Date(chatRoomTimestamp);
        chatRoomTimeString = chatRoomDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }

    return (
      <button onClick={() => openChatRoomModal(chatRoom.chatroomId)} className={`flex items-start py-1 px-4 mt-0 focus:outline-none w-full text-left ${index > 0 ? 'pt-4 pb-4' : 'pt-2 pb-4 '}`} key={chatRoom.chatroomId}>
        <div className="bg-gray-300 rounded-full h-14 w-14  mx-auto overflow-hidden border-2 border-gray-300 shrink-0"
             style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
          <AvatarIcon seed={chatRoom.chatWith} />
        </div>
        <div className="ml-4 flex flex-col flex-grow">
          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-x-2">
            <p className="text-black text-xl font-semibold mt-1 truncate">{truncatedChatWith}</p>
            <span className="text-gray-500 text-sm font-semibold justify-self-end -mr-2">{chatRoomTimeString}</span>
          </div>
          <div className="grid grid-cols-[1fr,auto] items-center gap-x-2">
            <p className="text-gray-500 text-sm truncate font-semibold overflow-hidden whitespace-nowrap mr-4">{chatRoom.lastestMessage}</p>
          </div>
        </div>
      </button>
    );
  })
) : (
  <div className="text-center text-black text-xl font-medium my-10">
    No chats created yet!
  </div>
  
)}


{/* Chat Room Modal */}
{showChatRoomModal && (
  <div className="flex items-center justify-center min-h-screen bg-gray-200 fixed inset-0 z-50">
  <div className="bg-white rounded-lg shadow-xl flex flex-col overflow-hidden relative" style={{ width: '500px', height: '812px' }}>
    <div className="p-4 flex items-center mt-2">
      <button onClick={handleCloseChatRoomModal} className="focus:outline-none">
        <FontAwesomeIcon icon={faArrowLeft} className="h-8 w-8 text-black" />
      </button>
      <div className="bg-gray-300 rounded-full h-10 w-10 mx-2 overflow-hidden border-2 border-gray-300 ml-4"
           style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
        <AvatarIcon seed={selectedChatRoomName} />
      </div>
      <h1 className="text-black text-2xl font-semibold ml-2">
        {selectedChatRoomName.substring(0, 8) + "..."}
      </h1>
    </div>
    <div className="flex-grow overflow-y-scroll bg-white text-white w-full mb-4 flex flex-col text-left p-3 -mt-3 rounded">
      {isLoadingChatMessages ? (
        <div className="flex justify-center mt-56">
          <FontAwesomeIcon icon={faSpinner} className="text-base-blue h-10 w-10 animate-spin" />
        </div>
      ) : (
        chatMessages.map((message) => {
          const chatRoomTimestamp = message.timestamp.seconds * 1000;
          const timeDifferenceMinutes = Math.floor((Date.now() - chatRoomTimestamp) / (1000 * 60));
          let chatRoomTimeString;
          if (timeDifferenceMinutes === 1) {
            chatRoomTimeString = `${timeDifferenceMinutes} min ago`;
          } else if (timeDifferenceMinutes < 60) {
            chatRoomTimeString = `${timeDifferenceMinutes} mins ago`;
          } else {
            const timeDifferenceHours = Math.floor(timeDifferenceMinutes / 60);
            chatRoomTimeString = timeDifferenceHours === 1
              ? `${timeDifferenceHours} hr ago`
              : `${timeDifferenceHours} hrs ago`;

            if (timeDifferenceMinutes >= 24 * 60) {
              const chatRoomDate = new Date(chatRoomTimestamp);
              chatRoomTimeString = chatRoomDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
          }

          const textOrRequest = message.payment_request_message ? "request" : "text";
          const bubbleColor = message.from === address ? "bg-blue-500 ml-10" : "bg-green-400 mr-10"; // Conditional color
        
          if (textOrRequest === 'text') {
            return (
              <div key={message.id} className={`${bubbleColor} rounded-2xl p-2 my-1 mt-2 text-white`}> {/* Individual message bubble */}
                <div className="mt-1 ml-1 mr-12 font-semibold text-white">{JSON.stringify(message.text_content).trim().slice(1, -1)}</div>
                <div className="text-xs text-right font-medium text-gray-100 -mt-4 mb-1 mr-1">{chatRoomTimeString}</div> {/* Timestamp */}
              </div>
            );
          } else if (textOrRequest === "request") {
            // Handle request content if needed
          }
        })
      )}
    </div>
    {/* Chat Input Box */}
    <div className="p-2 bg-white border-1 fixed bottom-0 border relative rounded-xl -mt-2 mb-2 ml-2 mr-2 flex items-center flex-shrink-0"> {/* Flex container */}
      <input
        type="text"
        placeholder="Enter message.."
        value={messageContent}
        onChange={handleInputChange}
        onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }} // Trigger sendMessage on Enter key
        className="flex-grow py-2 px-4 text-black rounded-l bg-white border-base-blue border-1 -ml-1 focus:outline-none"
      />
      <button onClick={sendMessage} className="bg-base-blue text-white rounded-xl p-2 mr-2">
        <FontAwesomeIcon icon={faPaperPlaneTop} className="ml-0.5 h-6 w-8 text-white" />
      </button>
    </div>
  </div>
  </div>
)}







      <div className="bg-white w-full -mb-2"></div>
      <div className="flex-grow flex items-center justify-center">
        {/* other content here */}
      </div>
      {!showModal && (
        <button
   className="bg-base-blue h-14 w-14 flex items-center justify-center rounded-full text-white fixed bottom-36 right-4 z-10 md:bottom-[calc(40%-140px)] md:right-[calc(50%-210px)]"
          onClick={() => setShowModal(true)} // Open modal on click
        >
          <FontAwesomeIcon icon={faMessagePen} className="h-7 w-7" />
        </button>
      )}



      {showModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-20">
  <div className="bg-white  h-full w-full md:w-[500px] md:h-[812px] relative pt-2" >
    <div className="p-4 flex items-center">
      <button onClick={handleCloseModal}> {/* Close modal on click */}
        <FontAwesomeIcon icon={faArrowLeft} className="h-6 w-6 text-black align-middle mt-3" />
      </button>
      <h1 className="text-black text-3xl font-semibold pt-2 ml-4">New Message</h1> 
    </div>
    <div className="px-4 pb-4 pt-0 flex items-center">
      <div className="flex items-center border-2 border-gray-600 rounded-3xl w-full p-2">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="pl-2 mr-2 text-black w-6 h-6" />
        <input
          type="text"
          placeholder="Search for a Goerli Base address..."
          value={searchAddress} // Controlled input
          onChange={(e) => setSearchAddress(e.target.value)} // Update state on input change
          onKeyPress={(e) => { if (e.key === 'Enter') createPrivateChatRoom(); }} // Trigger createPrivateChatRoom on Enter key
          className="w-full bg-transparent outline-none text-black text-base"
        />
      </div>
      <button onClick={createPrivateChatRoom} className="ml-4 mr-0 h-8 w-8 text-base-blue"> {/* Trigger createPrivateChatRoom on click */}
        <FontAwesomeIcon icon={faPaperPlaneTop} /> {/* Updated icon */}
      </button>
    </div>
    <div className="bg-gray-100 h-10 flex items-center shadow-sm mt-22">
      <span className="text-gray-500 text-base font-bold ml-4">Last Messaged</span>
    </div>

    <div className="text-center text-black text-sm font-medium my-10">
      Start using BasePay to find suggested contacts!
    </div>
    <div className="text-center ">
      <button
        className="w-40 h-12 bg-base-blue text-white font-semibold text-sm rounded-3xl shadow-md"
        onClick={() => setShowInviteModal(true)} // Open the invite modal on click
      >
        Invite to BasePay
      </button>
    </div>
    </div>


{/* Invite Modal */}
{showInviteModal && (
 <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
 <div className="bg-white w-96 p-6 rounded-xl shadow-xl drop-shadow" style={{ maxWidth: 'calc(100% - 2rem)', left: '1rem', right: '1rem' }}> {/* Manual control of width and padding */}
      <button onClick={handleInviteModalClose} className="absolute top-6 left-4">
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>
      <div className="text-black text-2xl font-bold text-center mt-8">
        Invite to <span className='text-base-blue'>BasePay</span>
      </div>
      <div className="flex flex-col items-center justify-center mt-6">
        <QRCode value="https://www.basepay.app" size={128} /> {/* Display the QR code */}
        <div className="text-black text-lg font-bold mt-4">Scan to visit BasePay</div>
        <div className="flex items-center justify-center text-black text-lg mt-4 mb-4">
          <span>basepay.app</span>
          <button onClick={() => navigator.clipboard.writeText("https://www.basepay.app")} className="ml-2 focus:outline-none text-gray-500">
            <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
          </button>
        </div>
        <button
          className="bg-base-blue text-white text-lg font-medium flex items-center justify-center w-full h-12 rounded-3xl focus:outline-none mt-2 mb-2"
          onClick={() => navigator.clipboard.writeText("https://www.basepay.app")}
        >
                <FontAwesomeIcon icon={faUpRightFromSquare} className="mr-2.5 h-4 w-4 text-white" />
          Copy Invite
        
        </button>
      </div>
    </div>
  </div>
)}


  </div>
)}
        


    </main>
    </div>
    </div>
  );
}