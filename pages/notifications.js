import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faListCheck, faArrowUpRightFromSquare, faEllipsis, faHandshakeSlash, faEye, faPaperPlane, faHand, faXmark, faFileInvoice, faBells, faCircleCheck, faSpinner, faUpRightFromSquare, faRightLeft, faCircleX, faRotateRight } from '@fortawesome/pro-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import Head from 'next/head';
import { useAccount } from "wagmi";
import createIcon from 'blockies';
import { useRouter } from 'next/router';
import { initiatePayment } from "../controller/contract-control"

const Notifications = () => {
  const { address } = useAccount();
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const sortedPaymentRequests = paymentRequests.sort((a, b) => b.request_time.seconds - a.request_time.seconds);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
const [selectedRequest, setSelectedRequest] = useState(null);
const [showConfirmDeclineModal, setShowConfirmDeclineModal] = useState(false);
const [showConfirmPayModal, setShowConfirmPayModal] = useState(false);
const [animateModal, setAnimateModal] = useState(false);
const [touchStartY, setTouchStartY] = useState(0); // State to track the touch start position
const [showPayRequestModal, setShowPayRequestModal] = useState(false);
const [selectedRequestToPay, setSelectedRequestToPay] = useState(null);
const router = useRouter();
const [showDeclineRequestTransactionModal, setShowDeclineRequestTransactionModal] = useState(false); // State for the request transaction modal
const [requestTransactionStatus, setRequestTransactionStatus] = useState(null); // State to track request transaction status
const [txHashState, setTxHashState] = useState('');
const [transactionStatus, setTransactionStatus] = useState(null);
const [showConfirmRequestTransactionModal, setShowConfirmRequestTransactionModal] = useState(false); 
const hasFetchedPaymentRequestsRef = useRef(false);
const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
const [refreshKey, setRefreshKey] = useState(0);

useEffect(() => {
  if (address) {
    // Function to fetch payment requests
    const fetchPaymentRequests = async () => {
      setIsLoadingNotifications(true); // Set loading state to true before fetching

      try {
        // Use the address from useAccount as the connected wallet
        const response = await fetch(`https://basepay-api.onrender.com/get-payment-request/${address}`);
        const data = await response.json();
        setPaymentRequests(data);
      } catch (error) {
        console.error('Error fetching payment requests:', error);
      }

      setIsLoadingNotifications(false); // Set loading state to false after fetching
    };

    fetchPaymentRequests();
    hasFetchedPaymentRequestsRef.current = false; // Reset fetch state
  }
}, [address, refreshKey]); // Will run when address changes or refreshKey changes


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
    document.body.style.overflowY = "hidden";
  };
  
  const closeDeclineModal = () => {
    setShowDeclineModal(false);
    setSelectedRequest(null);
    document.body.style.overflowY = "scroll"; 
  };


  const handleOutsideClick = (e) => {
    if (e.target.className.includes('outside-click')) {
      setAnimateModal(true); // Start the animation
      document.body.style.overflowY = "scroll"; // Remove scroll lock
      document.body.style.minHeight = "0px";
      window.scrollBy(0, -1);
      setTimeout(() => {
        setShowConfirmDeclineModal(false);
        setShowConfirmPayModal(false); // Close the modal after animation completes
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
      setShowConfirmDeclineModal(false);
      setShowConfirmPayModal(false); // Close the modal after animation completes
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
  setShowDeclineRequestTransactionModal(true);
  setRequestTransactionStatus('pending');

  try {
    const declineData = {
      decision: false // Boolean to indicate a decline
    };

    // Constructing the URL by appending the selected payment request ID
    const url = `https://basepay-api.onrender.com/update-transaction-state/${selectedRequest.paymentRequestId}`;

    // Make a PATCH request to the correct endpoint
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(declineData)
    });

    const responseData = await response.json();

    // Check if the request was successful
    if (response.ok && responseData.transaction_state === "Rejected") {
      console.log(`Declined the request with ID: ${selectedRequest.paymentRequestId}`);
      
      // Set a timeout and update the transaction state and UI
      setTimeout(() => {
        setRequestTransactionStatus('success'); // Update the status to success if the request succeeded
        selectedRequest.transaction_state = "Rejected"; // Update the transaction state of the selected request
      }, 750); // Introducing a delay for better UX

    } else {
      // Handle the error appropriately
      console.error('Error declining request:', responseData);
    }
  } catch (error) {
    console.error('Error declining request:', error);
    // Handle the error appropriately
  }
};

  // Function to open the pay modal
  const openPayModal = (request) => {
    setSelectedRequestToPay(request);
    setShowPayRequestModal(true);
    document.body.style.overflowY = "hidden"; // Apply scroll lock
  };

// Function to close the pay modal
const closePayModal = () => {
  setSelectedRequestToPay(null);
  setShowPayRequestModal(false);
  document.body.style.overflowY = "scroll"; // Remove scroll lock
};


const handleRequestButtonClick = () => {
  router.push('/pay?request=true');
};

const handlePayButttonClick = () => {
  router.push('/pay');
};  


const handleOpenPayConfirmModal = () => {
  document.body.style.overflowY = "hidden";
  document.body.style.minHeight = "calc(100vh + 1px)";
  window.scrollBy(0, 1);
  setShowConfirmPayModal(true); // Open the confirm request modal
};

const handleConfirmPayment = async () => {
  setTransactionStatus('pending'); // Set the status to pending before initiating payment

  const txHash = await initiatePayment(window.ethereum, selectedRequestToPay.payment_requester, selectedRequestToPay.ether_amount, async (receipt) => {
    if (receipt.status === 1) {
      setTransactionStatus('success'); // Update the status to success if the transaction succeeded

      // 1. PATCH to update the transaction hash
      const updateTransactionHashURL = `https://basepay-api.onrender.com/update-transaction-hash/${selectedRequestToPay.paymentRequestId}/${txHash}`;
      await fetch(updateTransactionHashURL, {
        method: 'PATCH'
      });

      // 2. PATCH to update the decision to true
      const confirmData = { decision: true };
      const url = `https://basepay-api.onrender.com/update-transaction-state/${selectedRequestToPay.paymentRequestId}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmData),
      });

      const responseData = await response.json();

      // Check if the request was successful and update the transaction state
      if (response.ok && responseData.transaction_state === "Processed") {
        selectedRequestToPay.transaction_state = "Processed";
      }
    } else {
      setTransactionStatus('fail'); // Update the status to fail if the transaction failed
    }
  });

  if (txHash) {
    setTxHashState(txHash);
    setShowConfirmPayModal(false);
    setShowConfirmRequestTransactionModal(true);
    setShowPayRequestModal(false);
  } else {
    // Handle failed payment logic here
  }
};



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
    <div className="bg-white rounded-lg shadow-xl flex flex-col overflow-hidden" style={{ width: '500px', height: '812px' }}>
      <main className="flex flex-col bg-white overflow-y-auto">
      <Head>
        {/* Other head content */}
      </Head>
      <div className="p-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-black text-3xl font-semibold pt-2 mr-1">Notifications</h1>
        <FontAwesomeIcon icon={faBells} className="h-7 w-7 text-black align-middle mt-2 ml-2" />
      </div>

      <div className="bg-base-blue rounded-full h-8 w-8 flex items-center justify-center mt-1.5">
  <FontAwesomeIcon
    icon={faRotateRight}
    className="h-4.5 w-4.5 text-white cursor-pointer" // Fixed class name
    onClick={() => setRefreshKey(refreshKey + 1)} // Increment refreshKey to trigger useEffect
  />
</div>
</div>
     
    <div className="bg-white w-full -mb-2"></div>
    <div className="px-4 mb-30">
      {isLoadingNotifications ? (
        <div className="flex justify-center mt-20">
          <FontAwesomeIcon icon={faSpinner} className="text-base-blue h-10 w-10 animate-spin" />
        </div>
      ) : sortedPaymentRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <div className="text-3xl -mt-80">🔔</div>
          <span className="text-black font-semibold text-xl mt-4">No notifications received yet!</span>
          <div className="flex w-full mt-14">
            <button className="bg-base-blue text-white font-medium rounded-full w-full py-2 mx-1 flex items-center justify-center" onClick={handlePayButttonClick}>
              <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4 text-white mr-2" />
              Pay
            </button>
            <button className="bg-base-blue text-white font-medium rounded-full w-full py-2 mx-1 flex items-center justify-center" onClick={handleRequestButtonClick}>
              <FontAwesomeIcon icon={faFileInvoice} className="h-4 w-4 text-white mr-2" />
              Request
            </button>
          </div>
          <span className="text-gray-600 font-medium text-base mt-4">
            Pay or Request on <span className="text-base-blue">BasePay</span> to receive
            <br />
            notifications!
          </span>
        </div>
      ) : (
        sortedPaymentRequests.map((request, index) => {
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
              <div className="relative w-full h-full overflow-hidden rounded-3xl" 
     style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
  <AvatarIcon seed={request.payment_requester} />
</div>
        {request.transaction_state === "Pending" && (
          <div className="bg-green-400 h-2 w-2 rounded-full absolute bottom-0 right-0 mb-0 mr-0"></div>
        )}
      </div>
                <div className="ml-4 flex-grow mt-4">
                  <div className={"flex justify-between items-center" + (!request.transaction_message ? " pb-2" : "")}>
                  <span className="text-black font-semibold">
  {request.transaction_state === "Processed" ? "Paid Request" : request.transaction_state === "Rejected" ? "Declined Request" : "Payment Request"}
</span>

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
         {request.transaction_state === "Pending" && (
  <div className="relative cursor-pointer" onClick={(e) => {
    e.stopPropagation(); // Stop propagation to the document
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  }}>
    <FontAwesomeIcon icon={faEllipsis} className="h-5 w-5 text-gray-400" />
    {openDropdownIndex === index && (
      <div ref={dropdownRef} className="absolute right-0 top-full mt-2 bg-base-blue border-white border-2 rounded-3xl py-4 shadow text-gray-700 w-56 text-sm z-10">
        <div className="p-4 -mt-2 cursor-pointer flex items-center relative border-b-2 border-white text-white text-lg" onClick={() => openPayModal(request)}>
          <FontAwesomeIcon icon={faPaperPlane} className="mr-3 h-5 w-5 text-white" />
          Pay Request
        </div>
        <div className="p-4 cursor-pointer flex items-center relative  text-white text-lg -mb-2" onClick={() => openDeclineModal(request)}>
          <FontAwesomeIcon icon={faCircleX} className="mr-3 h-5 w-5 text-white" />
          Decline Request
        </div>
      </div>
    )}
  </div>
)}
                </div>
              </div>
            </div>
          );
        }))}



{showDeclineModal && selectedRequest && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
    <div className="bg-white p-6 rounded-xl absolute shadow-xl drop-shadow" style={{ maxWidth: 'calc(100% - 2rem)', left: '1rem', right: '1rem' }}>
      <button onClick={closeDeclineModal} className="absolute top-6 left-4">
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>

      <div className="text-black text-2xl font-bold mt-6 text-center">Request Details</div>

      <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-8">
        <div className="flex justify-center items-center relative w-12 h-12 rounded-full bg-gray-300 shadow drop-shadow-sm">
          <FontAwesomeIcon icon={faEthereum} className="text-black h-8 w-8 z-10" />
        </div>
        <div className="text-gray-500 text-base ml-4 font-semibold">Amount: <span className="font-bold text-black">{selectedRequest.ether_amount} ETH</span></div>
    </div>

      <div className="flex justify-center mt-2"> {/* Centered icon div */}
      <div className=" w-16 h-10 rounded-2xl flex items-center justify-center p-0 mt-0">
        <FontAwesomeIcon icon={faRightLeft} className="text-base-blue h-5 w-5" />
      </div>
      </div>

      <div className="flex justify-center items-center -mt-2">
        <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-4">
          <div className="relative h-12 w-12 border-2 border-gray-300 rounded-3xl">
            <div className="relative w-full h-full overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
              <AvatarIcon seed={address} />
            </div>
          </div>
          <div className="text-gray-500 text-base ml-4 font-semibold">From: <span className="font-bold text-black">{address.substring(0, 6)}...{address.slice(-6)}</span></div>
        </div>
      </div>
      
      <div className="flex justify-center items-center mt-2">
        <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-4">
          <div className="relative h-12 w-12 border-2 border-gray-300 rounded-3xl">
            <div className="relative w-full h-full overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
              <AvatarIcon seed={selectedRequest.payment_requester} />
            </div>
          </div>
          <div className="text-gray-500 text-base ml-4 font-semibold">To: <span className="font-bold text-black">{selectedRequest.payment_requester.substring(0, 6)}...{selectedRequest.payment_requester.slice(-6)}</span></div>
        </div>
      </div>
     
     
       {/* Left-justified */}
       <div className={`text-black text-base font-semibold mt-7 ${selectedRequest.transaction_message ? 'text-left ml-2' : 'text-center ml-0'}`}>
  {selectedRequest.transaction_message 
    ? `Message: ${selectedRequest.transaction_message}` 
    : <i>No message sent with request</i>} {/* Conditional rendering */}
</div>
  
      <button className="bg-base-blue text-white text-lg font-medium w-full h-12 rounded-3xl flex justify-center items-center focus:outline-none mt-6" onClick={handleOpenDeclineRequestModal}>
     
        Decline Request
      </button>

      <div className="text-gray-500 text-sm mt-5 mb-0 text-center font-semibold ml-0">Request received on {new Date(selectedRequest.request_time.seconds * 1000).toLocaleDateString()}.</div>
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

              <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-8">
        <div className="flex justify-center items-center relative w-12 h-12 rounded-full bg-gray-300 shadow drop-shadow-sm">
          <FontAwesomeIcon icon={faEthereum} className="text-black h-8 w-8 z-10" />
        </div>
        <div className="text-gray-500 text-base ml-4 font-semibold">Amount: <span className="font-bold text-black">{selectedRequest.ether_amount} ETH</span></div>
    </div>

    <div className="flex justify-center items-center mt-2">
        <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-4">
          <div className="relative h-12 w-12 border-2 border-gray-300 rounded-3xl">
            <div className="relative w-full h-full overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
              <AvatarIcon seed={selectedRequest.payment_requester} />
            </div>
          </div>
          <div className="text-gray-500 text-base ml-4 font-semibold">Request From: <span className="font-bold text-black">{selectedRequest.payment_requester.substring(0, 6)}...{selectedRequest.payment_requester.slice(-6)}</span></div>
        </div>
      </div>
      <div className={`text-black text-base font-semibold mt-5 ${selectedRequest.transaction_message ? 'text-left ml-2' : 'text-center ml-0'}`}>
  {selectedRequest.transaction_message 
    ? `Message: ${selectedRequest.transaction_message}` 
    : <i>No message sent with request</i>} {/* Conditional rendering */}
</div>
  
              <button
  className="bg-base-blue text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-3xl focus:outline-none mt-4 mb-2"
  onClick={handleConfirmDecline}
>
  Confirm Decline
</button>
<div className="text-gray-500 text-sm mt-5 mb-0 text-center font-semibold ml-0">Request received on {new Date(selectedRequest.request_time.seconds * 1000).toLocaleDateString()}.</div>
            </div>
          </div>
        </div>
      )}




{showDeclineRequestTransactionModal && (
  <div className="fixed top-0 left-0 w-full h-full z-40 flex items-center justify-center">
    <div className="bg-black opacity-50 w-full h-full absolute"></div>
    <div className="bg-white p-6 rounded-xl absolute top-1/6 inset-x-4 shadow-xl drop-shadow">
      <button className="p-4 cursor-pointer absolute top-2 left-1" onClick={() => {
          document.body.style.overflowY = "scroll"; // Remove scroll lock
          document.body.style.minHeight = "0px";
          window.scrollBy(0, -1);
          setShowDeclineRequestTransactionModal(false); // Close the request transaction modal
        }}> 
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>

      {requestTransactionStatus === 'pending' && (
        <div className="mt-14 ml-0">
          <div className="flex justify-center items-center mb-10 relative"> 
            <div className="bg-gray-300 w-16 h-16 rounded-full absolute shadow drop-shadow"></div> 
            <FontAwesomeIcon icon={faEthereum} className="text-black h-9 w-9 z-10" /> 
          </div>
          <div className="text-center mb-4"> 
            <div className="text-black font-bold text-2xl">{selectedRequest.ether_amount} ETH</div>
          </div>
          {/* Removed the "View on Basescan" link as it's not relevant for the request */}
          <div className="flex items-center justify-start mb-6"> 
            <FontAwesomeIcon icon={faSpinner} className="text-base-blue h-7 w-7 animate-spin" />
            <span className="ml-4 mt-0.5 text-black font-semibold">Declining Payment Request...</span>
          </div>
          <div className="flex justify-center items-center mt-2">
        <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-0 mb-6">
          <div className="relative h-12 w-12 border-2 border-gray-300 rounded-3xl">
            <div className="relative w-full h-full overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
              <AvatarIcon seed={selectedRequest.payment_requester} />
            </div>
          </div>
          <div className="text-gray-500 text-base ml-4 font-semibold">Request From: <span className="font-bold text-black">{selectedRequest.payment_requester.substring(0, 6)}...{selectedRequest.payment_requester.slice(-6)}</span></div>
        </div>
      </div>
        
          <div className="ml-0">
          <div className={`text-black text-base font-semibold ${selectedRequest.transaction_message ? 'text-left ml-2 mt-0' : 'text-center mt-0 ml-0'}`}>
  {selectedRequest.transaction_message 
    ? `Message: ${selectedRequest.transaction_message}` 
    : <i>No message sent with request</i>} {/* Conditional rendering */}
</div>
          </div>
          <button className="bg-gray-300 text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-xl focus:outline-none mt-10 mb-0" >
            Continue
          </button>
        </div>
      )}

      {requestTransactionStatus === 'success' && (
        <div className="mt-14 ml-0">
          <div className="flex justify-center items-center mb-10 relative"> 


    
          
            <div className="bg-gray-300 w-16 h-16 rounded-full absolute shadow drop-shadow"></div> 
            <FontAwesomeIcon icon={faEthereum} className="text-black h-9 w-9 z-10" /> 
          </div>
          <div className="text-center mb-4"> 
            <div className="text-black font-bold text-2xl">{selectedRequest.ether_amount} ETH</div>
          </div>
          {/* You can customize the link as needed */}
          <div className="flex items-center justify-start mb-6"> 
            <FontAwesomeIcon icon={faCircleCheck} className="text-base-blue h-7 w-7" /> 
            <span className="ml-4 mt-0.5 text-black font-semibold">Payment Request Declined!</span>
          </div>

   

    <div className="flex justify-center items-center mt-2">
        <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-0 mb-6">
          <div className="relative h-12 w-12 border-2 border-gray-300 rounded-3xl">
            <div className="relative w-full h-full overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
              <AvatarIcon seed={selectedRequest.payment_requester} />
            </div>
          </div>
          <div className="text-gray-500 text-base ml-4 font-semibold">Request From: <span className="font-bold text-black">{selectedRequest.payment_requester.substring(0, 6)}...{selectedRequest.payment_requester.slice(-6)}</span></div>
        </div>
      </div>
        

         
          <div className="ml-0">
          <div className={`text-black text-base font-semibold ${selectedRequest.transaction_message ? 'text-left ml-2 mt-0' : 'text-center mt-0 ml-0'}`}>
  {selectedRequest.transaction_message 
    ? `Message: ${selectedRequest.transaction_message}` 
    : <i>No message sent with request</i>} {/* Conditional rendering */}
</div>
  
          </div>
          <button className="bg-base-blue shadow-sm drop-shadow text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-xl focus:outline-none mt-6 mb-0" onClick={() => {
              document.body.style.overflowY = "scroll"; // Remove scroll lock
              document.body.style.minHeight = "0px";
              window.scrollBy(0, -1);
              setShowDeclineRequestTransactionModal(false);
              setShowConfirmDeclineModal(false);
              setShowDeclineModal(false); // Close the success modal
            }}>
            Continue
          </button>
        </div>
      )}
    </div>
  </div>
)}






{showPayRequestModal && selectedRequestToPay && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
    <div className="bg-white p-6 rounded-xl absolute shadow-xl drop-shadow" style={{ maxWidth: 'calc(100% - 2rem)', left: '1rem', right: '1rem' }}>
      <button onClick={closePayModal} className="absolute top-6 left-4">
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>
      <div className="text-black text-2xl font-bold mt-6 text-center">Payment Details:</div>
      <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-8">
        <div className="flex justify-center items-center relative w-12 h-12 rounded-full bg-gray-300 shadow drop-shadow-sm">
          <FontAwesomeIcon icon={faEthereum} className="text-black h-8 w-8 z-10" />
        </div>
        <div className="text-gray-500 text-base ml-4 font-semibold">Amount: <span className="font-bold text-black">{selectedRequestToPay.ether_amount} ETH</span></div>
      </div>

      <div className="flex justify-center mt-2"> {/* Centered icon div */}
      <div className=" w-16 h-10 rounded-2xl flex items-center justify-center p-0 mt-0">
        <FontAwesomeIcon icon={faRightLeft} className="text-base-blue h-5 w-5" />
      </div>
      </div>

      <div className="flex justify-center items-center mt-2">
        <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-0">
          <div className="relative h-12 w-12 border-2 border-gray-300 rounded-3xl">
            <div className="relative w-full h-full overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
              <AvatarIcon seed={selectedRequestToPay.payment_requester} />
            </div>
          </div>
          <div className="text-gray-500 text-base ml-4 font-semibold">Pay To: <span className="font-bold text-black">{selectedRequestToPay.payment_requester.substring(0, 6)}...{selectedRequestToPay.payment_requester.slice(-6)}</span></div>
        </div>
      </div>
      <div className={`text-black text-base font-semibold mt-5 ${selectedRequestToPay.transaction_message ? 'text-left ml-2' : 'text-center ml-0'}`}>
        {selectedRequestToPay.transaction_message 
          ? `Message: ${selectedRequestToPay.transaction_message}` 
          : <i>No message sent with request</i>} {/* Conditional rendering */}
      </div>
      <button className="bg-base-blue text-white text-lg font-medium w-full h-12 rounded-3xl focus:outline-none mt-6" onClick={handleOpenPayConfirmModal}>
        Pay Request
      </button>
      <div className="text-gray-500 text-sm mt-5 mb-0 text-center font-semibold ml-0">
        Request received on {new Date(selectedRequestToPay.request_time.seconds * 1000).toLocaleDateString()}.
      </div>
    </div>
  </div>
)}


{/* Confirm Pay Request Modal */}
{showConfirmPayModal && selectedRequestToPay && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 outside-click" onClick={handleOutsideClick}>
    <div className="bg-black opacity-50 w-full h-full outside-click"></div>
    <div className={`bg-white w-full rounded-t-2xl absolute ${animateModal ? '-bottom-full motion-reduce:transition-all duration-700 ease-in-out' : 'bottom-0'}`}>
      <div className="bg-gray-300 w-18 h-1 mx-auto mt-4 rounded-full cursor-pointer"
           onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} 
           onClick={handleCloseAnimation}></div>
      <div className="p-4">
        <div className="text-2xl text-black font-bold">
          Confirm Payment
        </div>
        <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-8">
          <div className="flex justify-center items-center relative w-12 h-12 rounded-full bg-gray-300 shadow drop-shadow-sm">
            <FontAwesomeIcon icon={faEthereum} className="text-black h-8 w-8 z-10" />
          </div>
          <div className="text-gray-500 text-base ml-4 font-semibold">Amount: <span className="font-bold text-black">{selectedRequestToPay.ether_amount} ETH</span></div>
        </div>
        <div className="flex justify-center items-center mt-2">
          <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-4">
            <div className="relative h-12 w-12 border-2 border-gray-300 rounded-3xl">
              <div className="relative w-full h-full overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
                <AvatarIcon seed={selectedRequestToPay.payment_requester} />
              </div>
            </div>
            <div className="text-gray-500 text-base ml-4 font-semibold">Pay To: <span className="font-bold text-black">{selectedRequestToPay.payment_requester.substring(0, 6)}...{selectedRequestToPay.payment_requester.slice(-6)}</span></div>
          </div>
        </div>
        <div className={`text-black text-base font-semibold mt-5 ${selectedRequestToPay.transaction_message ? 'text-left ml-2' : 'text-center ml-0'}`}>
          {selectedRequestToPay.transaction_message 
            ? `Message: ${selectedRequestToPay.transaction_message}` 
            : <i>No message sent with request</i>} {/* Conditional rendering */}
        </div>
        <button className="bg-base-blue text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-3xl focus:outline-none mt-4 mb-2" onClick={handleConfirmPayment}>
          Confirm Payment
        </button>
        <div className="text-gray-500 text-sm mt-5 mb-0 text-center font-semibold ml-0">Request received on {new Date(selectedRequestToPay.request_time.seconds * 1000).toLocaleDateString()}.</div>
      </div>
    </div>
  </div>
)}



{/* Transaction Modal */}
{showConfirmRequestTransactionModal  && selectedRequestToPay && (
  <div className="fixed top-0 left-0 w-full h-full z-40 flex items-center justify-center">
    <div className="bg-black opacity-50 w-full h-full absolute"></div>
    <div className="bg-white p-6 rounded-xl absolute top-1/6 inset-x-4 shadow-xl drop-shadow"> 
      <button className="p-4 cursor-pointer absolute top-2 left-1" onClick={() => {
          document.body.style.overflowY = "scroll"; // Remove scroll lock
          document.body.style.minHeight = "0px";
          window.scrollBy(0, -1);
          setshowConfirmRequestTransactionModal(false); // Close the transaction modal
        }}> 
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>

      {transactionStatus === 'pending' && (
        <div className="mt-14 ml-0">
          <div className="flex justify-center items-center mb-10 relative"> 
            <div className="bg-gray-300 w-16 h-16 rounded-full absolute shadow drop-shadow"></div> 
            <FontAwesomeIcon icon={faEthereum} className="text-black h-9 w-9 z-10" /> 
          </div>
          <div className="text-center mb-4"> 
            <div className="text-black font-bold text-2xl">{selectedRequestToPay.ether_amount} ETH</div>
          </div>
          <div className="flex items-center justify-start mb-6"> 
            <FontAwesomeIcon icon={faSpinner} className="text-base-blue h-7 w-7 animate-spin" />
            <span className="ml-4 mt-0.5 text-black font-semibold">Transaction in Progress...</span>
          </div>
          <div className="flex justify-center items-center mt-2">
            <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-0 mb-6">
              <div className="relative h-12 w-12 border-2 border-gray-300 rounded-3xl">
                <div className="relative w-full h-full overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
                  <AvatarIcon seed={selectedRequestToPay.payment_requester} />
                </div>
              </div>
              <div className="text-gray-500 text-base ml-4 font-semibold">Pay To: <span className="font-bold text-black">{selectedRequestToPay.payment_requester.substring(0, 6)}...{selectedRequestToPay.payment_requester.slice(-6)}</span></div>
            </div>
          </div>
          <div className={`text-black text-base font-semibold ${selectedRequestToPay.transaction_message ? 'text-left ml-2 mt-0' : 'text-center mt-0 ml-0'}`}>
            {selectedRequestToPay.transaction_message 
              ? `Message: ${selectedRequestToPay.transaction_message}` 
              : <i>No message sent with request</i>} {/* Conditional rendering */}
          </div>
          <button className="bg-gray-300 text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-xl focus:outline-none mt-6 mb-0">
            Continue
          </button>
        </div>
      )}

      {transactionStatus === 'success' && (
        <div className="mt-14 ml-0">
          <div className="flex justify-center items-center mb-10 relative"> 
            <div className="bg-gray-300 w-16 h-16 rounded-full absolute shadow drop-shadow"></div> 
            <FontAwesomeIcon icon={faEthereum} className="text-black h-9 w-9 z-10" /> 
          </div>
          <div className="text-center mb-4"> 
            <div className="text-black font-bold text-2xl">{selectedRequestToPay.ether_amount} ETH</div>
          </div>
          <div className="flex items-center justify-start mb-6"> 
            <FontAwesomeIcon icon={faCircleCheck} className="text-base-blue h-7 w-7" /> 
            <span className="ml-4 mt-0.5 text-black font-semibold">Payment Request Paid!</span>
          </div>
          <div className="flex justify-center items-center mt-2">
            <div className="w-full bg-gray-100 h-18 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4 mt-0 mb-6">
              <div className="relative h-12 w-12 border-2 border-gray-300 rounded-3xl">
                <div className="relative w-full h-full overflow-hidden rounded-3xl" style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
                  <AvatarIcon seed={selectedRequestToPay.payment_requester} />
                </div>
              </div>
              <div className="text-gray-500 text-base ml-4 font-semibold">Pay To: <span className="font-bold text-black">{selectedRequestToPay.payment_requester.substring(0, 6)}...{selectedRequestToPay.payment_requester.slice(-6)}</span></div>
            </div>
          </div>
          <div className={`text-black text-base font-semibold ${selectedRequestToPay.transaction_message ? 'text-left ml-2 mt-0' : 'text-center mt-0 ml-0'}`}>
            {selectedRequestToPay.transaction_message 
              ? `Message: ${selectedRequestToPay.transaction_message}` 
              : <i>No message sent with request</i>} {/* Conditional rendering */}
          </div>
          <button className="bg-base-blue shadow-sm drop-shadow text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-xl focus:outline-none mt-6 mb-0" onClick={() => {
              document.body.style.overflowY = "scroll"; // Remove scroll lock
              document.body.style.minHeight = "0px";
              window.scrollBy(0, -1);
              setShowConfirmRequestTransactionModal(false);
              setShowConfirmPayModal(false);
              setShowPayRequestModal(false); // Close the success modal
            }}>
            Continue
          </button>
        </div>
      )}



{transactionStatus === 'fail' && (
  <div className="mt-14 ml-0">
    <div className="flex justify-center items-center mb-10 relative">
      <div className="bg-gray-300 w-16 h-16 rounded-full absolute shadow drop-shadow"></div>
      <FontAwesomeIcon icon={faEthereum} className="text-black h-9 w-9 z-10" /> 
    </div>
    <div className="text-center mb-4"> 
      <div className="text-black font-bold text-2xl">{counter || '0'} ETH</div>
    </div>

    <div className="mb-10 text-center text-gray-600 font-medium"> {/* Added a "View on Basescan" link */}
  <a href={`https://goerli.basescan.org/tx/${txHashState}`} target="_blank" rel="noopener noreferrer" className="flex justify-center items-center">
    View on <span className="text-gray-600 ml-1 font-semibold">BaseScan</span> <FontAwesomeIcon icon={faUpRightFromSquare} className="h-4.5 w-4.5 ml-2 text-gray-500" />
  </a>
</div>

    <div className="flex items-center justify-start mb-6"> 
    <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 h-7 w-7" /> 
          <span className="ml-4 mt-0.5 text-black font-semibold">Transaction Failed!</span>
        </div>

    <div className=" mb-4">
      <div className="text-black font-semibold">Transaction to {toAddress.length === 42 ? toAddress.substring(0, 6) + '...' + toAddress.substring(toAddress.length - 6) : toAddress} on Goerli Base Chain failed!</div>
    </div>
    <div className="ml-0">
      <div className="text-gray-700 font-medium text-lg"> {forValue || "No note added"}</div>
    </div>
    <button className="bg-base-blue shadow-sm drop-shadow text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-xl focus:outline-none mt-10 mb-0" onClick={() => {
        document.body.style.overflowY = "scroll"; // Remove scroll lock
        document.body.style.minHeight = "0px";
        window.scrollBy(0, -1);
        setShowtransactionModal(false); // Close the success modal
      }}>
      Retry
    </button>
  </div>
)}

    </div>
  </div>
)}







      </div>
    </main>
    </div>
    </div>
  );
};

export default Notifications;
