import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faListCheck, faArrowUpRightFromSquare, faEllipsis, faHandshakeSlash, faEye, faPaperPlane, faHand, faXmark } from '@fortawesome/pro-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import Head from 'next/head';
import { useAccount } from "wagmi";
import createIcon from 'blockies';

const Notifications = () => {
  const { address } = useAccount();
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const sortedPaymentRequests = paymentRequests.sort((a, b) => b.request_time.seconds - a.request_time.seconds);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
const [selectedRequest, setSelectedRequest] = useState(null);
const [showConfirmDeclineModal, setShowConfirmDeclineModal] = useState(false);
const [animateModal, setAnimateModal] = useState(false);
const [touchStartY, setTouchStartY] = useState(0); // State to track the touch start position


  useEffect(() => {
    // Function to fetch payment requests
    const fetchPaymentRequests = async () => {
      try {
        // Use the address from useAccount as the connected wallet
        const response = await fetch(`https://basepay-api.onrender.com/get-payment-request/${address}`);
        const data = await response.json();
        setPaymentRequests(data);
      } catch (error) {
        console.error('Error fetching payment requests:', error);
      }
    };

    fetchPaymentRequests();
  }, [address]);

  const AvatarIcon = ({ seed }) => {
    const avatarRef = useRef(null);
  
    useEffect(() => {
      const icon = createIcon({
        seed: seed,
        color: '#000000', // Foreground color
 
        bgcolor: '#ffffff',
        size: 11, // Width/height of the icon in blocks
        scale: 4  // Width/height of each block in pixels
      });
  
      if (avatarRef.current) {
        avatarRef.current.innerHTML = ''; // Clear previous children
        avatarRef.current.appendChild(icon);
      }
    }, [seed]);
    return <div ref={avatarRef} className="ml-0"></div>;
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const openDeclineModal = (request) => {
    setSelectedRequest(request);
    setShowDeclineModal(true);
  };
  
  const closeDeclineModal = () => {
    setShowDeclineModal(false);
    setSelectedRequest(null);
  };


  const handleOutsideClick = (e) => {
    if (e.target.className.includes('outside-click')) {
      setAnimateModal(true); // Start the animation
      document.body.style.overflowY = "scroll"; // Remove scroll lock
      document.body.style.minHeight = "0px";
      window.scrollBy(0, -1);
      setTimeout(() => {
        setShowConfirmDeclineModal(false); // Close the modal after animation completes
        setAnimateModal(false); // Reset the animation state
      }, 150); // 150 milliseconds
    }
  };


  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY > touchStartY + 50) { // 50px threshold for swipe-down
      handleCloseDeclineRequestModal(); 
    }
  };


  const handleCloseAnimation = () => {
    setAnimateModal(true); // Start the animation
    document.body.style.overflowY = "scroll"; // Remove scroll lock
    document.body.style.minHeight = "0px";
    window.scrollBy(0, -1);
    setTimeout(() => {
      setShowConfirmDeclineModal(false); // Close the modal after animation completes
      setAnimateModal(false); // Reset the animation state
    }, 300); // 300 milliseconds
  };


  const handleCloseDeclineRequestModal = () => {
    document.body.style.overflowY = "scroll";
    document.body.style.minHeight = "0px";
    window.scrollBy(0, -1);
    setShowConfirmDeclineModal(false);
  };

  const handleOpenDeclineRequestModal = () => {
    document.body.style.overflowY = "hidden";
    document.body.style.minHeight = "calc(100vh + 1px)";
    window.scrollBy(0, 1);
    setShowConfirmDeclineModal(true); // Open the confirm request modal
  };
  
 
  const handleConfirmDecline = async () => {
    try {
      const declineData = {
        decision: "false" // String to indicate a decline
      };
  
      // Constructing the URL by appending the selected request ID
      const url = `https://basepay-api.onrender.com/update-transaction-state/${selectedRequest.id}`;
  
      // Make a PATCH request to the correct endpoint
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(declineData)
      });
  
      // Check if the request was successful
      if (response.ok) {
        console.log(`Declined the request with ID: ${selectedRequest.id}`);
        // You can close the decline modal and refresh the request list or do any other UI updates here
        handleCloseConfirmRequestModal();
      } else {
        // Handle the error appropriately
        console.error('Error declining request:', await response.json());
      }
    } catch (error) {
      console.error('Error declining request:', error);
      // Handle the error appropriately
    }
  };



  
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Head>
        {/* Other head content */}
      </Head>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
        <h1 className="text-black text-3xl font-semibold pt-2 mr-1">Notifications</h1>
          <FontAwesomeIcon icon={faBell} className="h-6 w-6 text-black align-middle mt-2 ml-2" />
        </div>
        <div className="bg-base-blue rounded-full h-8 w-8 flex items-center justify-center mt-2">
          <FontAwesomeIcon icon={faListCheck} className="text-white h-4 w-4" />
        </div>
      </div>
      <div className="bg-white w-full -mb-2"></div>
      <div className="px-4 mb-30">
      {sortedPaymentRequests.map((request, index) => {
          // Convert the request time to a readable format
          const requestDate = new Date(request.request_time.seconds * 1000);
          const now = new Date();
          const timeDifferenceMinutes = Math.floor((now - requestDate) / (60 * 1000));

          let requestTimeString;
          if (timeDifferenceMinutes === 1) {
            requestTimeString = `${timeDifferenceMinutes} min ago`;
          } else if (timeDifferenceMinutes < 60) {
            requestTimeString = `${timeDifferenceMinutes} mins ago`;
          } else {
            const timeDifferenceHours = Math.floor(timeDifferenceMinutes / 60);
            requestTimeString = timeDifferenceHours === 1
              ? `${timeDifferenceHours} hr ago`
              : `${timeDifferenceHours} hrs ago`;
        
            if (timeDifferenceMinutes >= 24 * 60) {
              requestTimeString = requestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
          }
  
          const paymentRequester = request.payment_requester.substring(0, 5) + '...';

       

          return (
            <div key={index} className="rounded-4xl border-2 border-gray-100 w-full shadow-sm mt-4">
              <div className={"flex items-center" + (!request.transaction_message ? " pb-0 mt-1 " : " mt-0.5 mb-0")}>
              <div className={"relative h-12 w-12 border-2 border-gray-300 rounded-3xl ml-4" + (!request.transaction_message ? " -mb-2" : " -mb-3.5")}>
        <div className="relative w-full h-full overflow-hidden rounded-3xl">
          <AvatarIcon seed={request.payment_requester} />
        </div>
        <div className="bg-green-400 h-2 w-2 rounded-full absolute bottom-0 right-0 mb-0 mr-0"></div>
      </div>
                <div className="ml-4 flex-grow mt-4">
                  <div className={"flex justify-between items-center" + (!request.transaction_message ? " pb-2" : "")}>
                    <span className="text-black font-semibold">Payment Request</span>
                    <span className="text-gray-500 mr-4 font-medium">{requestTimeString}</span>
                  </div>
                  <div className={"flex justify-between items-center " + (!request.transaction_message ? " pb-1" : "mt-1")}>
                    <div className="flex items-center text-black font-semibold">
                      <FontAwesomeIcon icon={faEthereum} className="h-3.5 w-3.5 text-black mr-1 mb-0.5" />
                      <span>{request.ether_amount}</span>
                    </div>
                    <div className="flex items-center text-gray-500 font-medium mr-4">
                      <span>From {paymentRequester}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"flex justify-between text-gray-500 text-sm ml-4.5 mt-3 mb-4 font-semibold mr-4" + (!request.transaction_message ? " -mt-1 mb-4" : "")}>
  <span>
    {request.transaction_message ? (
      <span>
        <span className="text-gray-500">Message:</span> {request.transaction_message}
      </span>
    ) : (
      <span className="text-gray-500 italic">No message sent with request</span>
    )}
       </span>
       <div className="relative cursor-pointer" onClick={(e) => {
            e.stopPropagation(); // Stop propagation to the document
            setOpenDropdownIndex(openDropdownIndex === index ? null : index);
          }}>
                  <FontAwesomeIcon icon={faEllipsis} className="h-5 w-5 text-gray-400" />
                  {openDropdownIndex === index && (
  <div ref={dropdownRef} className="absolute right-0 top-full mt-2 bg-white border-gray-200 border-2 rounded-3xl py-4 shadow text-gray-700 w-56 text-sm z-10">
    <div className="p-4 -mt-2 cursor-pointer flex items-center relative border-b-2 border-gray-200 text-black text-base">
      <FontAwesomeIcon icon={faPaperPlane} className="mr-3 h-5 w-5 text-base-blue" />
      Pay Request
    </div>
    <div className="p-4 cursor-pointer flex items-center relative border-b-2 border-gray-200 text-black text-base" onClick={() => openDeclineModal(request)}>
  <FontAwesomeIcon icon={faHandshakeSlash} className="mr-3 h-5 w-5 text-base-blue" />
  Decline Request
</div>
    <div className="p-4 cursor-pointer flex items-center text-black text-base -mb-3">
      <FontAwesomeIcon icon={faEye} className="mr-3 h-5 w-5 text-base-blue" />
      Mark as Read
    </div>
  </div>
)}
                </div>
              </div>
            </div>
          );


        })}

{showDeclineModal && selectedRequest && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
    <div className="bg-white p-6 rounded-xl absolute shadow-xl drop-shadow" style={{ maxWidth: 'calc(100% - 2rem)', left: '1rem', right: '1rem' }}>
      <button onClick={closeDeclineModal} className="absolute top-6 left-4">
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>
      <div className="text-black text-lg font-bold mt-14 text-center">Request Details:</div>
      <div className="text-black text-base mt-2 text-center">Amount: {selectedRequest.ether_amount} ETH</div>
      <div className="text-black text-base mt-2 text-center">From: {selectedRequest.payment_requester.substring(0, 6)}...{selectedRequest.payment_requester.slice(-6)}</div>
      <div className="text-black text-base mt-2 text-center">Request Sent on {new Date(selectedRequest.request_time.seconds * 1000).toLocaleDateString()}</div>
      <div className="text-black text-base mt-2 text-center">Message: {selectedRequest.transaction_message || 'No message sent with request'}</div>
      <button className="bg-base-blue text-white text-lg font-medium w-full h-12 rounded-3xl focus:outline-none mt-6"  onClick={handleOpenDeclineRequestModal}>
        Decline Request
      </button>
    </div>
  </div>
)}

   {/* Confirm Decline Request Modal */}
   {showConfirmDeclineModal && selectedRequest && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 outside-click" onClick={handleOutsideClick}>
          <div className="bg-black opacity-50 w-full h-full outside-click"></div>
          <div className={`bg-white w-full rounded-t-2xl absolute ${animateModal ? '-bottom-full motion-reduce:transition-all duration-700 ease-in-out' : 'bottom-0'}`}>
            <div className="bg-gray-300 w-18 h-1 mx-auto mt-4 rounded-full cursor-pointer"
                 onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} 
                 onClick={handleCloseAnimation}></div>
            <div className="p-4">
              {/* Display details */}
              <div className="text-2xl text-black font-bold">
                Decline Request
              </div>
              <div className="text-black text-base mt-2 text-center">Amount: {selectedRequest.ether_amount} ETH</div>
              <div className="text-black text-base mt-2 text-center">From: {selectedRequest.payment_requester.substring(0, 6)}...{selectedRequest.payment_requester.slice(-6)}</div>
              <div className="text-black text-base mt-2 text-center">Request Sent on {new Date(selectedRequest.request_time.seconds * 1000).toLocaleDateString()}</div>
              <div className="text-black text-base mt-2 text-center">Message: {selectedRequest.transaction_message || 'No message sent with request'}</div>
              <button
  className="bg-base-blue text-white text-2xl font-medium flex items-center justify-center h-12 w-full rounded-3xl focus:outline-none mt-4 mb-2"
  onClick={handleConfirmDecline}
>
  Confirm Decline
</button>
            </div>
          </div>
        </div>
      )}



      </div>
    </main>
  );
};

export default Notifications;
