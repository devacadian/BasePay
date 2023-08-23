import React, { useEffect, useState, useRef, useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faBarcodeRead, faPaperPlane, faFileInvoice, faXmark, faSpinner, faCircleCheck, faTimesCircle, faUpRightFromSquare, faArrowLeft, faPaste, faQrcode } from '@fortawesome/pro-solid-svg-icons';
import { faClockNine } from '@fortawesome/pro-regular-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import { initiatePayment } from "../controller/contract-control"
import { useAccount } from "wagmi";
import { useBalance } from 'wagmi';
import { useNetwork } from 'wagmi';
import { useChainModal } from '@rainbow-me/rainbowkit'; 
import createIcon from 'blockies';
import { BrowserMultiFormatReader } from '@zxing/library';
import { NotificationContext } from "../components/NotificationProvider";

const Pay = () => {
  const [counter, setCounter] = useState('0');
  const [formattedBalance, setFormattedBalance] = useState('0.0000'); // State for formatted balance
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data, isLoading } = useBalance({ address });
  const router = useRouter();
  const defaultNetworkName = 'Ethereum';
  const chainName = chain?.name || defaultNetworkName;
  const isBaseGoerli = chain?.name === 'Base Goerli';
  const [containerWidth, setContainerWidth] = useState('w-20');
  const { openChainModal } = useChainModal();
  const [isClient, setIsClient] = useState(false);
  const [showPaySelectionModal, setshowPaySelectionModal] = useState(false); // State to control the modal display
  const [showconfirmpayModal, setShowconfirmpayModal] = useState(false);
  const [toAddress, setToAddress] = useState('');
  const [forValue, setForValue] = useState('');
  const [requestNote, setrequestNote] = useState('');
  const [showtransactionModal, setShowtransactionModal] = useState(false); // State for the new modal
  const [transactionStatus, setTransactionStatus] = useState(null); // State to track transaction status
  const [txHashState, setTxHashState] = useState('');
  const [showRequestSelectionModal, setshowRequestSelectionModal] = useState(router.query.request === 'true');
  const [showRequestModal, setShowRequestModal] = useState(false); // Add this state variable for the new Request Modal
  const [showConfirmRequestModal, setShowConfirmRequestModal] = useState(false);
  const [showRequestTransactionModal, setShowRequestTransactionModal] = useState(false); // State for the request transaction modal
  const [requestTransactionStatus, setRequestTransactionStatus] = useState(null); // State to track request transaction status
  const [requestTxHashState, setRequestTxHashState] = useState(''); // State to store the transaction hash for the request
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef(null);
  const [showQRChoiceModal, setShowQRChoiceModal] = useState(false);
  const { showNotification } = useContext(NotificationContext);


  useEffect(() => {
    setContainerWidth(chain?.name === 'Base Goerli' ? 'w-24' : 'w-20');
    setIsClient(true);
  }, [chain?.name]);

  useEffect(() => {
    const balanceValue = parseFloat(data?.formatted || '0.0000');
    setFormattedBalance(balanceValue.toFixed(4));
}, [data]);



const handleNumberClick = (number) => {
  if (number === '.' && counter.includes('.')) return; // Prevent more than one decimal point

  let newCounter = counter + number;

  // If the counter starts with '00', replace with '0'
  if (newCounter.startsWith('00')) {
    newCounter = newCounter.substring(1);
  }

  // If the counter starts with '0' followed by a number, remove the '0'
  if (newCounter.length > 1 && newCounter.startsWith('0') && newCounter[1] !== '.') {
    newCounter = newCounter.substring(1);
  }

  // If the counter starts with '.', prepend with '0'
  if (newCounter.startsWith('.')) {
    newCounter = '0' + newCounter;
  }

  // Ensure that there are no more than 4 digits after the decimal point
  const parts = newCounter.split('.');
  if (parts.length > 1 && parts[1].length > 4) {
    newCounter = parts[0] + '.' + parts[1].substring(0, 4);
  }

  setCounter(newCounter);
};


  const handleBackspace = () => {
    setCounter(counter.slice(0, -1));
  };

  const handlePayClick = () => {
    if (Number(counter) === 0) {
      showNotification("Must be greater than 0 ETH to proceed to pay modal.", "error");
      // You can display a message or do something else here if needed
      return;
    }

    
  // Convert the balance data to a number
  const balance = parseFloat(data?.formatted || '0.0000');

  // Check if counter is greater than the available balance
  if (Number(counter) > balance) {
    showNotification("Payment cannot exceed available balance.", "error");
    return;
  }
  
  
    setshowPaySelectionModal(true); // Show the modal when the Pay button is clicked
  };

  const handleCloseModal = () => {
    setshowPaySelectionModal(false);
    setToAddress('');
    setForValue('');
    setCounter('0');

  };


  const handleOutsideClick = (e) => {
    if (e.target.className.includes('outside-click')) {
      setAnimateModal(true); // Start the animation
      document.body.style.overflowY = "scroll"; // Remove scroll lock
      document.body.style.minHeight = "0px";
      window.scrollBy(0, -1);
      setTimeout(() => {
        setShowconfirmpayModal(false); // Close the modal after animation completes
        setAnimateModal(false); // Reset the animation state
      }, 150); // 150 milliseconds
    }
  };

  const [animateModal, setAnimateModal] = useState(false);

  const handleCloseAnimation = () => {
    setAnimateModal(true); // Start the animation
    document.body.style.overflowY = "scroll"; // Remove scroll lock
    document.body.style.minHeight = "0px";
    window.scrollBy(0, -1);
    setTimeout(() => {
      setShowconfirmpayModal(false); // Close the modal after animation completes
      setAnimateModal(false); // Reset the animation state
    }, 300); // 300 milliseconds
  };

  const handleOpenconfirmpayModal = () => {
    // Check if no address is entered
    if (toAddress.length === 0) {
      showNotification("No address entered!", "error");
      return; // Exit the function if no address is entered
    }
  
    // Check if the "to" field's length is exactly 42 characters
    if (toAddress.length !== 42) {
      showNotification("Address incorrect - ensure 42 character address is input.", "error");
      return; // Exit the function if the condition is not met
    }
  
    document.body.style.overflowY = "hidden";
    document.body.style.minHeight = "calc(100vh + 1px)";
    window.scrollBy(0, 1);
    setShowconfirmpayModal(true);
  };
  


  // Function to close the payment modal
  const handleCloseconfirmpayModal = () => {
    document.body.style.overflowY = "scroll";
    document.body.style.minHeight = "0px";
    window.scrollBy(0, -1);
    setShowconfirmpayModal(false);
  };


  
  const [touchStartY, setTouchStartY] = useState(0); // State to track the touch start position

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY > touchStartY + 50) { // 50px threshold for swipe-down
      handleCloseconfirmpayModal(); 
    }
  };
  
  const handleConfirmPayment = async () => {
    setTransactionStatus('pending'); // Set the status to pending before initiating payment
  
    const txHash = await initiatePayment(window.ethereum, toAddress, counter || '0', (receipt) => {
      if (receipt.status === 1) {
        setTransactionStatus('success'); // Update the status to success if the transaction succeeded
      } else {
        setTransactionStatus('fail'); // Update the status to fail if the transaction failed
      }
    });
  
    if (txHash) {
      setTxHashState(txHash);
      setShowconfirmpayModal(false);
      setShowtransactionModal(true);
      setshowPaySelectionModal(false);
    } else {
      // Handle failed payment logic here
    }
  };


  const handleRequestClick = () => {
    setshowRequestSelectionModal(true); // Show the modal when the Request button is clicked
  };

  const handleCloseRequestSelectionModal = () => {
    // Create a copy of the query object without the 'request' key
    const { request, ...newQuery } = router.query;
  
    // Replace the URL with the new query object
    router.replace({
      pathname: router.pathname,
      query: newQuery,
    });
  
    setshowRequestSelectionModal(false);
    setToAddress('');
    setrequestNote('');
    setCounter('0');
  };

  const handleOpenRequestModal = () => {
    // Check if the "to" field is empty
    if (toAddress === '') {
      showNotification("No address entered!", "error");
      return; // Exit the function if no address is entered
    }
  
    // Check if the "to" field's length is exactly 42 characters
    if (toAddress.length !== 42) {
      showNotification("Address incorrect - ensure 42 character address is input.", "error");
      return; // Exit the function if the condition is not met
    }
  
    // Check if the "to" address is the same as the user's own address
    if (toAddress === address) {
      showNotification("Cannot send request to own address!", "error");
      return; // Exit the function if the addresses are the same
    }
  
    if (counter && counter !== '0') {
      // Set the request counter to be the same value
      setCounter(counter);
    } else {
      // If not, set the request counter to '0.00'
      setCounter('');
    }
  
    setShowRequestModal(true);
  };
  

// Function to handle closing the Request Modal
const handleCloseRequestModal = () => {
  // Reset the counter value back to '0' when closing the request modal
  // Clear the 'toAddress' and 'requestNote' fields

  setShowRequestModal(false);
};

const handlePasteClick = () => {
  navigator.clipboard.readText().then((text) => {
    setToAddress(text.trim());
  });
};


const handleCounterChange = (e) => {
  // Get the value from the event
  let value = e.target.value.trim();

  // If the value starts with '00', replace with '0'
  if (value.startsWith('00')) {
    value = value.substring(1);
  }

  // If the value starts with '0' followed by a number, remove the '0'
  if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
    value = value.substring(1);
  }

  // If the value starts with '.', prepend with '0'
  if (value.startsWith('.')) {
    value = '0' + value;
  }

  // Ensure that there are no more than 4 digits after the decimal point
  const parts = value.split('.');
  if (parts.length > 1 && parts[1].length > 4) {
    value = parts[0] + '.' + parts[1].substring(0, 4);
  }

  // Allow only numbers and up to 4 decimal points
  if (/^(\d+\.?\d{0,4}|\.\d{0,4})$/.test(value) || value === '') {
    setCounter(value);
  }
};


const handleOpenConfirmRequestModal = () => {
  document.body.style.overflowY = "hidden";
  document.body.style.minHeight = "calc(100vh + 1px)";
  window.scrollBy(0, 1);
  setShowConfirmRequestModal(true); // Open the confirm request modal
};

const handleCloseConfirmRequestModal = () => {
  setAnimateModal(true); // Start the animation
  document.body.style.overflowY = "scroll"; // Remove scroll lock
  document.body.style.minHeight = "0px";
  window.scrollBy(0, -1);
  setTimeout(() => {
    setShowConfirmRequestModal(false); // Close the modal after animation completes
    setAnimateModal(false); // Reset the animation state
  }, 300); // 300 milliseconds
};


const handleConfirmRequest = async () => {
  setShowRequestTransactionModal(true);
  setRequestTransactionStatus('pending');
 
  try {
    // Define the request data based on the state variables
    const requestData = {
      payment_requester: address, // Assuming this is the requester's address
      request_recipient: toAddress,
      ether_amount: counter || '0',
      transaction_message: requestNote || ''
    };

    // Make a POST request to the correct endpoint
    const response = await fetch('https://basepay-api.onrender.com/create-payment-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

  // Get the new document ID from the response
  const documentId = await response.json();
  console.log(`Created payment request with ID: ${documentId}`);

  if (documentId) {
    setTimeout(() => {
      setRequestTransactionStatus('success'); // Update the status to success if the request succeeded
      setRequestTxHashState(documentId); // Store the new document ID
      setShowConfirmRequestModal(false); // Close the confirm request modal
      setShowRequestTransactionModal(true);
    }, 750); // Introducing a delay of 0.75 seconds (750 milliseconds) before updating the status for better UX
  }
} catch (error) {
  console.error('Error creating payment request:', error);
  // Handle the error appropriately
}
};



const [animateRequestModal, setAnimateRequestModal] = useState(false);
const [touchStartRequestY, setTouchStartRequestY] = useState(0);

const handleOutsideClickRequest = (e) => {
  if (e.target.className.includes('outside-click')) {
    setAnimateRequestModal(true);
    document.body.style.overflowY = "scroll";
    document.body.style.minHeight = "0px";
    window.scrollBy(0, -1);
    setTimeout(() => {
      setShowConfirmRequestModal(false);
      setAnimateRequestModal(false);
    }, 150);
  }
};

const handleTouchStartRequest = (e) => {
  setTouchStartRequestY(e.touches[0].clientY);
};

const handleTouchEndRequest = (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  if (touchEndY > touchStartRequestY + 50) {
    handleCloseConfirmRequestModal();
  }
};

const handleCloseAnimationRequest = () => {
  setAnimateRequestModal(true);
  document.body.style.overflowY = "scroll";
  document.body.style.minHeight = "0px";
  window.scrollBy(0, -1);
  setTimeout(() => {
    setShowConfirmRequestModal(false);
    setAnimateRequestModal(false);
  }, 300);
};

const AvatarIcon = ({ seed }) => {
  const avatarRef = useRef(null);

  useEffect(() => {
    const icon = createIcon({
      seed: seed,
      color: '#000000', // Slightly darker gray foreground color
      bgcolor: '#ffffff',
      size: 11, // Width/height of the icon in blocks
      scale: 7  // Width/height of each block in pixels
    });

    if (avatarRef.current) {
      avatarRef.current.innerHTML = ''; // Clear previous children
      avatarRef.current.appendChild(icon);
    }
  }, [seed]);
  return <div ref={avatarRef} className="ml-0"></div>;
};


const navigateToProfile = () => {
  router.push('/profile');
};


const handleVideoRef = (video) => {
  videoRef.current = video;
  if (video) {
    const constraints = {
      video: {
        facingMode: 'environment', // Request the back camera
      },
    };

    const stopVideoStream = () => {
      const tracks = video.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
      video.srcObject = null;
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        video.srcObject = stream;
        video.play(); // Ensure the video is playing

        // ZXing code reader
        const codeReader = new BrowserMultiFormatReader();
        codeReader.decodeFromVideoElement(video)
          .then((result) => {
            let address = result.getText();

            // Check for known prefixes and extract the address
            if (address.startsWith('eth:')) {
              address = address.substring(4);
            } else if (address.startsWith('ethereum:')) {
              address = address.substring(9);
            }

            // Split at "@" symbol to remove network information, if present
            address = address.split('@')[0];

            // Verify that the extracted address is valid
            if (address.length === 42 && address.startsWith('0x')) {
              setToAddress(address); // Update the "to" value
              setShowScanner(false);

              stopVideoStream(); // Stop the video stream

              codeReader.reset(); // Reset the reader to stop scanning
            } else {
              console.error('Invalid Ethereum address scanned:', address);
            }
          })
          .catch((error) => console.error(error));
      })
      .catch(console.error);
  }
};

const handleScanClick = (actionType) => {
  setShowQRChoiceModal(false);
  setShowScanner(true);
  actionType(); // Call either handlePayClick or handleRequestClick
};


// Function to handle open QR Choice modal
const handleOpenQRChoiceModal = () => {
  setShowQRChoiceModal(true);
  document.body.style.overflowY = "hidden"; // Apply scroll lock
};

// Function to handle close QR Choice modal
const handleCloseQRChoiceModal = () => {
  setShowQRChoiceModal(false);
  document.body.style.overflowY = "scroll"; // Remove scroll lock
};


  return (
<main className="min-h-screen flex flex-col bg-white pb-20">
      <div style={{ background: 'linear-gradient(to bottom, #0e76fd, #ffffff)' }} className="flex-grow flex flex-col">
        <Head>
          <title>Payment Page</title>
          <meta name="description" content="Handle payments here" />
        </Head>
        <div className="px-4 pb-0 pt-8 flex items-center w-full justify-between">
        <div className="flex items-center">
          <div
            className="bg-gray-100 rounded-full h-7 w-7 flex items-center justify-center"
            onClick={navigateToProfile} // Add onClick event here
          >
            <FontAwesomeIcon icon={faClockNine} className="h-7 w-7 text-base-blue" />
          </div>
  <div className={`${containerWidth} h-8 rounded-4xl bg-gray-100 border-base-blue border-2 flex items-center justify-center text-xs text-black font-semibold ml-4`}
       onClick={openChainModal}>
    {isClient && isBaseGoerli ? (
      <>
        <img src="/assets/Base_Network_Logo.svg" alt="Network Logo" className="mr-1 h-3 w-3" />
        <FontAwesomeIcon icon={faEthereum} className="mr-1 text-black h-3 w-3" />
      </>
    ) : (
      <FontAwesomeIcon icon={faEthereum} className="mr-1 text-black h-3 w-3" />
    )}
    {formattedBalance}
  </div>
</div>
<div className="flex items-center relative">
<div className="bg-gray-100 absolute h-6 w-7 rounded-md" onClick={handleOpenQRChoiceModal}  />
      <FontAwesomeIcon icon={faBarcodeRead} className="h-7 w-7 text-base-blue z-10" onClick={() => setShowQRChoiceModal(true)} />
    </div>
      </div>
      <div className="text-6xl font-semibold mb-4 text-black flex justify-center items-baseline -ml-10 mt-10">
            <FontAwesomeIcon icon={faEthereum} className="mr-0 text-black h-10 w-10" /> 
            <span className="text-center">{counter || '0'}</span>
          </div>
          <div className="flex justify-center mb-6"> 
        <div className="bg-gray-100 rounded-4xl w-20 h-6 text-center"> 
          <span className="text-gray-800 text-sm font-bold">ETH</span>
          </div>
          </div>
          </div>
          <div className="grid grid-cols-3 gap-x-0 gap-y-8 mb-8 mt-0">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, '<'].map((number, index) => (
              <button
                key={index}
                className="p-4 rounded-lg focus:outline-none focus:border-blue-300 text-black text-xl font-bold"
                onClick={() => (number === '<' ? handleBackspace() : handleNumberClick(number))}
              >
                {number}
              </button>
            ))}
      </div>
      <div className="w-full flex justify-center space-x-3 px-4 mb-20">
        <button onClick={handlePayClick} className="w-1/2 bg-base-blue text-white text-lg font-medium flex items-center justify-center h-12 rounded-3xl focus:outline-none">
          <FontAwesomeIcon icon={faPaperPlane} className="mr-2 h-4 w-4 text-white" />
          Pay
        </button>
        <button onClick={handleRequestClick} className="w-1/2 bg-base-blue text-white text-lg font-medium flex items-center justify-center h-12 rounded-3xl focus:outline-none"> {/* Update here */}
          <FontAwesomeIcon icon={faFileInvoice} className="mr-2 h-4 w-4 text-white" />
          Request
        </button>
      </div>

      {showQRChoiceModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
    <div className="bg-white p-6 rounded-xl absolute top-1/6 inset-x-4 shadow-xl drop-shadow">
    <button onClick={handleCloseQRChoiceModal}  className="z-40 absolute top-6 left-4">
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>
      <div className="flex flex-col items-center justify-center mt-6">
      <div className="text-black text-2xl font-bold mb-4">
          <span className="inline-flex items-center">Scan QR Code <FontAwesomeIcon icon={faQrcode} className="text-black h-6 w-6 ml-2 -mt-0" /></span> {/* Wrapped in a span */}
        </div>
        <button onClick={() => handleScanClick(handlePayClick)} className="w-full bg-base-blue text-white text-lg font-medium flex items-center justify-center h-12 rounded-3xl focus:outline-none mb-4">
          <FontAwesomeIcon icon={faPaperPlane} className="mr-2 h-4 w-4 text-white" />
          Scan & Pay
        </button>
        <button onClick={() => handleScanClick(handleRequestClick)} className="w-full bg-base-blue text-white text-lg font-medium flex items-center justify-center h-12 rounded-3xl focus:outline-none mb-2">
          <FontAwesomeIcon icon={faFileInvoice} className="mr-2 h-4 w-4 text-white" />
          Scan & Request
        </button>
      </div>
    </div>
  </div>
)}

      
{/* Pay User Selection Modal */}
{showPaySelectionModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-20">
    <div className="bg-white w-full h-full relative pt-2">
      <div className="px-4 pt-0 grid grid-cols-3 items-center">
        <button className="p-4 -ml-4 cursor-pointer" onClick={handleCloseModal}> 
          <FontAwesomeIcon icon={faXmark} className="h-7 w-7 text-black" />
        </button>
        <div className="text-black text-2xl font-bold flex items-center justify-center"> 
          <FontAwesomeIcon icon={faEthereum} className="mr-0 text-black h-5 w-5" /> 
          {counter || '0'} 
        </div>
        <div className="flex justify-end"> 
        <button onClick={handleOpenconfirmpayModal} className="bg-base-blue text-white text-lg font-medium flex items-center justify-center h-10 w-24 rounded-3xl focus:outline-none">
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2 h-4 w-4 text-white" /> 
              Pay
            </button>
          </div>
      </div>
      <div className="border-t border-gray-300 mt-2"></div> 
      <div className="px-4 py-2 flex items-center">
        <label htmlFor="to" className="text-black text-lg font-bold mr-2">To:</label> 
        <input
  type="text"
  id="to"
  className="rounded p-2 flex-grow ml-1 text-black font-medium outline-none"
  placeholder="Enter Goerli Base address..."
  value={toAddress}
  onChange={(e) => setToAddress(e.target.value.trim())} // Trim method here to prevent sending to incorrect addresses
/>

<button onClick={handlePasteClick} className="mr-2"> {/* Paste Button */}
    <FontAwesomeIcon icon={faPaste} className="h-5.5 w-5.5 text-black" />
  </button>
  <button onClick={() => setShowScanner(true)}> {/* Trigger Scanner */}
  <FontAwesomeIcon icon={faBarcodeRead} className="h-6 w-6 text-black ml-2" />
</button>
      </div>
      <div className="border-t border-gray-300"></div> 
      <div className="px-4 py-2 flex items-center">
        <label htmlFor="for" className="text-black text-lg font-bold mr-2">For:</label> 
        <input
      type="text"
      id="for"
      className="rounded p-2 flex-grow text-gray-600 font-medium outline-none"
      placeholder="Add a note"
      value={forValue}
      onChange={(e) => setForValue(e.target.value)} // Update the state with the entered value
    />
      </div>

      {showScanner && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
    <div className="bg-white p-6 rounded-xl absolute top-1/6 inset-x-4 shadow-xl drop-shadow">
      <button
        onClick={() => {
          setShowScanner(false);
          const video = videoRef.current;
          if (video && video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            video.srcObject = null;
          }
        }}
        className="z-40 absolute top-6 left-4"
      >
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>
      <div className="flex flex-col items-center justify-center mt-4">
        <div className="text-black text-2xl font-bold mb-4">Pay Address</div> {/* "Pay" text */}
        <div className="relative">
          <video ref={handleVideoRef} className="z-40 rounded-lg" autoPlay /> {/* Scanner Display with rounded corners */}
          
          {/* Scan Overlay */}
          <div className="absolute top-20 left-10 border-t-3 border-l-3 border-base-blue h-7 w-7 rounded-tl "></div>
          <div className="absolute top-20 right-10 border-t-3 border-r-3 border-base-blue h-7 w-7 rounded-tr"></div>
          <div className="absolute bottom-20 left-10 border-b-3 border-l-3 border-base-blue h-7 w-7 rounded-bl"></div>
          <div className="absolute bottom-20 right-10 border-b-3 border-r-3 border-base-blue h-7 w-7 rounded-br"></div>
        </div>
        <div className="text-black text-lg font-bold mt-6 mb-2">
          <span className="text-base-blue">Scanning</span> for addresses...
        </div> 
      </div>
    </div>
  </div>
)}


      <div className="bg-gray-100 h-10 flex items-center">
        <span className="text-gray-500 text-base font-bold ml-4">Suggested</span>
      </div>

      <div className="text-center text-black text-sm font-medium my-10">
        Start using BasePay to find suggested contacts!
      </div>
      {/* Add your user selection content here */}
    </div>
  </div>
)}



{/* Confirm Modal */}
{showconfirmpayModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 outside-click" onClick={handleOutsideClick}>
    <div className="bg-black opacity-50 w-full h-full outside-click"></div>
    <div className={`bg-white w-full rounded-t-2xl absolute ${animateModal ? '-bottom-full motion-reduce:transition-all duration-700 ease-in-out' : 'bottom-0'}`}>

      <div className="bg-gray-300 w-18 h-1 mx-auto mt-4 rounded-full cursor-pointer"
           onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} // Touch handler to the gray drag bar
           onClick={handleCloseAnimation}></div> {/* Clickable drag bar */}
      <div className="p-4">
        <div className="flex items-center text-2xl text-black font-bold">
          <FontAwesomeIcon icon={faEthereum} className="mr-2 text-black h-5 w-5" />
          {counter || '0'} 
        </div>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-3xl w-26 h-12 flex items-center justify-center"> 
            <span className="text-black font-medium text-lg">Pay To</span> 
          </div>
        </div>
        <div className="mt-4 ml-1 text-black font-medium text-2xl">
  {toAddress.length === 42
    ? toAddress.substring(0, 6) + '...' + toAddress.substring(toAddress.length - 6)
    : toAddress}
</div>
        <div className="mt-2 ml-1 text-gray-600 font-medium text-lg">
  {forValue || "No note added"}
</div>
<button
            className="bg-base-blue text-white text-2xl font-medium flex items-center justify-center h-12 w-full rounded-3xl focus:outline-none mt-4 mb-2"
            onClick={handleConfirmPayment} 
          >
            Confirm
          </button>
      </div>
    </div>
  </div>
)}



{/* Transaction Modal */}

{showtransactionModal && (
  <div className="fixed top-0 left-0 w-full h-full z-40 flex items-center justify-center">
    <div className="bg-black opacity-50 w-full h-full absolute"></div>
    <div className="bg-white p-6 rounded-xl absolute top-1/6 inset-x-4 shadow-xl drop-shadow"> 
      <button className="p-4 cursor-pointer absolute top-2 left-1" onClick={() => {
          document.body.style.overflowY = "scroll"; // Remove scroll lock
          document.body.style.minHeight = "0px";
          window.scrollBy(0, -1);
          setShowtransactionModal(false); // Close the transaction modal
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
      <div className="text-black font-bold text-2xl">{counter || '0'} ETH</div>
    </div>


    <div className="mb-6 text-center text-gray-600 font-medium"> {/* Added a "View on Basescan" link */}
  <a href={`https://goerli.basescan.org/tx/${txHashState}`} target="_blank" rel="noopener noreferrer" className="flex justify-center items-center">
    View on <span className="text-gray-600 ml-1 font-semibold">BaseScan</span> <FontAwesomeIcon icon={faUpRightFromSquare} className="h-4.5 w-4.5 ml-2 text-gray-500" />
  </a>
</div>


    <div className="flex items-center justify-start mb-6"> 
    <FontAwesomeIcon icon={faSpinner} className="text-base-blue h-7 w-7 animate-spin" />
          <span className="ml-4 mt-0.5 text-black font-semibold">Transaction in Progress...</span>
        </div>

    <div className=" mb-4"> 
      <div className="text-black font-semibold">Transaction to {toAddress.length === 42 ? toAddress.substring(0, 6) + '...' + toAddress.substring(toAddress.length - 6) : toAddress} on Goerli Base Chain is processing.</div>
    </div>
    <div className="ml-0">
    <div className={`text-gray-600 font-medium text-lg ${forValue ? 'text-left' : 'text-left'}`}>
  {forValue
    ? `Message: ${forValue}`
    : <i>No note added</i>} {/* Conditional rendering */}
</div>
    </div>
    <button className="bg-gray-300 text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-xl focus:outline-none mt-6 mb-0" >
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
      <div className="text-black font-bold text-2xl">{counter || '0'} ETH</div>
    </div>

    <div className="mb-6 text-center text-gray-600 font-medium"> {/* Added a "View on Basescan" link */}
  <a href={`https://goerli.basescan.org/tx/${txHashState}`} target="_blank" rel="noopener noreferrer" className="flex justify-center items-center">
    View on <span className="text-gray-600 ml-1 font-semibold">BaseScan</span> <FontAwesomeIcon icon={faUpRightFromSquare} className="h-4.5 w-4.5 ml-2 text-gray-500" />
  </a>
</div>

    <div className="flex items-center justify-start mb-6"> 
      <FontAwesomeIcon icon={faCircleCheck} className="text-base-blue h-7 w-7" /> 
      <span className="ml-4 mt-0.5 text-black font-semibold">Transaction Successful!</span>
    </div>

    <div className=" mb-4"> 
      <div className="text-black font-semibold">Sent successfully to {toAddress.length === 42 ? toAddress.substring(0, 6) + '...' + toAddress.substring(toAddress.length - 6) : toAddress} on Goerli Base Chain using <span className='text-base-blue'>BasePay</span>!</div>
    </div>
    <div className="ml-0">
    <div className={`text-gray-600 font-medium text-lg ${forValue ? 'text-left' : 'text-left'}`}>
  {forValue
    ? `Message: ${forValue}`
    : <i>No note added</i>} {/* Conditional rendering */}
</div>

    </div>
    <button className="bg-base-blue shadow-sm drop-shadow text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-xl focus:outline-none mt-6 mb-0" onClick={() => {
        document.body.style.overflowY = "scroll"; // Remove scroll lock
        document.body.style.minHeight = "0px";
        window.scrollBy(0, -1);
        setShowtransactionModal(false);
        setToAddress(''); // Close the success modal
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




{/* Request User Selection Modal */}
{showRequestSelectionModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-20">
    <div className="bg-white w-full h-full relative pt-2">
      <div className="px-4 pt-0 grid grid-cols-3 items-center">
        <button className="p-4 -ml-4 cursor-pointer" onClick={handleCloseRequestSelectionModal}> 
          <FontAwesomeIcon icon={faArrowLeft} className="h-7 w-7 text-black" />
        </button>
        <div className="text-black text-2xl font-bold flex items-center justify-center"> 
          Request
        </div>
        <div className="flex justify-end"></div> {/* Empty div to keep the grid layout */}
      </div>
      <div className="border-t border-gray-300 mt-2"></div> 
      <div className="px-4 py-2 flex items-center">
        <label htmlFor="to" className="text-black text-lg font-bold mr-2">To:</label> 
        <input
          type="text"
          id="to"
          className="rounded p-2 flex-grow ml-1 text-black font-medium outline-none"
          placeholder="Enter Goerli Base address..."
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value.trim())}
        />
         <button onClick={handlePasteClick} className="ml-1 mr-2"> {/* Add button wrapper */}
    <FontAwesomeIcon icon={faPaste} className="h-5.5 w-5.5 text-black" /> {/* Paste icon */}
  </button>
  <button onClick={() => setShowScanner(true)}> {/* Trigger Scanner */}
  <FontAwesomeIcon icon={faBarcodeRead} className="h-6 w-6 text-black ml-2" />
</button>
</div>
      <div className="bg-gray-100 h-10 flex items-center">
        <span className="text-gray-500 text-base font-bold ml-4">Suggested</span>
      </div>

      <div className="text-center text-black text-sm font-medium my-10">
        Start using BasePay to find suggested contacts!
      </div>

      {showScanner && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
    <div className="bg-white p-6 rounded-xl absolute top-1/6 inset-x-4 shadow-xl drop-shadow">
      <button
        onClick={() => {
          setShowScanner(false);
          const video = videoRef.current;
          if (video && video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            video.srcObject = null;
          }
        }}
        className="z-40 absolute top-6 left-4"
      >
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>
      <div className="flex flex-col items-center justify-center mt-4">
        <div className="text-black text-2xl font-bold mb-4">Request to Address</div> {/* "Pay" text */}
        <div className="relative">
          <video ref={handleVideoRef} className="z-40 rounded-lg" autoPlay /> {/* Scanner Display with rounded corners */}
          
          {/* Scan Overlay */}
          <div className="absolute top-20 left-10 border-t-3 border-l-3 border-base-blue h-7 w-7 rounded-tl "></div>
          <div className="absolute top-20 right-10 border-t-3 border-r-3 border-base-blue h-7 w-7 rounded-tr"></div>
          <div className="absolute bottom-20 left-10 border-b-3 border-l-3 border-base-blue h-7 w-7 rounded-bl"></div>
          <div className="absolute bottom-20 right-10 border-b-3 border-r-3 border-base-blue h-7 w-7 rounded-br"></div>
        </div>
        <div className="text-black text-lg font-bold mt-6 mb-2">
          <span className="text-base-blue">Scanning</span> for addresses...
        </div> 
      </div>
    </div>
  </div>
)}

      {/* Add your user selection content here */}
      
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6"> {/* Button container */}
        <button onClick={handleOpenRequestModal} className="bg-base-blue text-white text-lg font-medium flex items-center justify-center h-12 w-full rounded-3xl focus:outline-none">
          Next
        </button>
      </div> {/* End of Button container */}
    </div>
  </div>
)}


{/* Request Modal */}
{showRequestModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-20">
    <div className="bg-white w-full h-full relative pt-2">
      <div className="px-4 pt-0 grid grid-cols-3 items-center">
        <button className="p-4 -ml-4 cursor-pointer" onClick={handleCloseRequestModal}> 
          <FontAwesomeIcon icon={faArrowLeft} className="h-7 w-7 text-black" />
        </button>
        <div className="text-black text-2xl font-bold flex items-center justify-center">
          Request
        </div>
        <div className="flex justify-end"></div> {/* Empty div to keep the grid layout */}
      </div>
      <div className="flex justify-center"> {/* Gray circle */}
      <div className="bg-gray-300 border-3 border-gray-300 rounded-full h-20 w-20 mt-6 flex items-center justify-center overflow-hidden"
       style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
    <AvatarIcon seed={toAddress} />
  </div>
</div>
      <div className="text-center text-black text-lg font-medium mt-6"> {/* Displaying the truncated toAddress */}
        {toAddress.length === 42 ? toAddress.substring(0, 6) + '...' + toAddress.substring(toAddress.length - 6) : toAddress}
      </div>

<div className="text-5xl font-semibold mb-2 text-black flex justify-center items-baseline -ml-5 mt-5">
  <FontAwesomeIcon icon={faEthereum} className="-mr-0 text-black h-9 w-9" />
  <input
    type="text"
    style={{ width: `${(counter.length || 4) }ch` }} // Adjust width based on content
    className="text-center bg-transparent outline-none border-none" // Tailwind CSS classes
    value={counter}
    onChange={handleCounterChange}
    placeholder="0.00"
  />
</div>

      <div className="text-center mt-0 text-lg text-gray-600 font-medium">
  <input
    type="text"
    className="rounded p-2 text-center w-2/3 outline-none" // Added outline-none here
    placeholder="Add a Note"
    value={requestNote}
    onChange={(e) => setrequestNote(e.target.value)}
  />
</div>

<div className="fixed bottom-0 left-0 right-0 px-4 pb-6"> {/* Request button container */}
<button 
    className="bg-base-blue text-white text-lg font-medium flex items-center justify-center h-12 w-full rounded-3xl focus:outline-none" 
    onClick={handleOpenConfirmRequestModal} // Call the function to open the Confirm Request Modal
  >
    <FontAwesomeIcon icon={faFileInvoice} className="mr-2 h-4 w-4 text-white" /> {/* File invoice icon */}
    Request
  </button>
</div>
    </div>
  </div>
)}




{/* Request Confirm Modal */}
{showConfirmRequestModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 outside-click" onClick={handleOutsideClickRequest}>
    <div className="bg-black opacity-50 w-full h-full outside-click"></div>
    <div className={`bg-white w-full rounded-t-2xl absolute ${animateRequestModal ? '-bottom-full motion-reduce:transition-all duration-700 ease-in-out' : 'bottom-0'}`}>
      <div className="bg-gray-300 w-18 h-1 mx-auto mt-4 rounded-full cursor-pointer"
           onTouchStart={handleTouchStartRequest} onTouchEnd={handleTouchEndRequest}
           onClick={handleCloseAnimationRequest}></div> {/* Clickable drag bar */}
      <div className="p-4">
        <div className="flex items-center text-2xl text-black font-bold">
          <FontAwesomeIcon icon={faEthereum} className="mr-2 text-black h-5 w-5" />
          {counter || '0'} 
        </div>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-3xl w-34 h-12 flex items-center justify-center"> 
            <span className="text-black font-medium text-lg">Request To</span> 
          </div>
        </div>
        <div className="mt-4 ml-1 text-black font-medium text-2xl">
          {toAddress.length === 42
            ? toAddress.substring(0, 6) + '...' + toAddress.substring(toAddress.length - 6)
            : toAddress}
        </div>
        <div className="mt-2 ml-1 text-gray-600 font-medium text-lg">
          {requestNote || "No note added"}
        </div>
        <button
            className="bg-base-blue text-white text-2xl font-medium flex items-center justify-center h-12 w-full rounded-3xl focus:outline-none mt-4 mb-2"
            onClick={handleConfirmRequest} 
          >
            Confirm
          </button>
      </div>
    </div>
  </div>
)}





{showRequestTransactionModal && (
  <div className="fixed top-0 left-0 w-full h-full z-40 flex items-center justify-center">
    <div className="bg-black opacity-50 w-full h-full absolute"></div>
    <div className="bg-white p-6 rounded-xl absolute top-1/6 inset-x-4 shadow-xl drop-shadow">
      <button className="p-4 cursor-pointer absolute top-2 left-1" onClick={() => {
          document.body.style.overflowY = "scroll"; // Remove scroll lock
          document.body.style.minHeight = "0px";
          window.scrollBy(0, -1);
          setShowRequestTransactionModal(false); // Close the request transaction modal
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
            <div className="text-black font-bold text-2xl">{counter || '0'} ETH</div>
          </div>
          {/* Removed the "View on Basescan" link as it's not relevant for the request */}
          <div className="flex items-center justify-start mb-6"> 
            <FontAwesomeIcon icon={faSpinner} className="text-base-blue h-7 w-7 animate-spin" />
            <span className="ml-4 mt-0.5 text-black font-semibold">Request in Progress...</span>
          </div>
          <div className="mb-4"> 
            <div className="text-black font-semibold">Request to {toAddress.length === 42 ? toAddress.substring(0, 6) + '...' + toAddress.substring(toAddress.length - 6) : toAddress} on Goerli Base Chain is processing.</div>
          </div>
          <div className="ml-0">
          <div className="text-gray-600 font-medium text-lg">
  {requestNote ? `Message: ${requestNote}` : <i>No note added</i>}
</div>
          </div>
          <button className="bg-gray-300 text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-xl focus:outline-none mt-6 mb-0" >
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
            <div className="text-black font-bold text-2xl">{counter || '0'} ETH</div>
          </div>
          {/* You can customize the link as needed */}
          <div className="flex items-center justify-start mb-6"> 
            <FontAwesomeIcon icon={faCircleCheck} className="text-base-blue h-7 w-7" /> 
            <span className="ml-4 mt-0.5 text-black font-semibold">Request Successful!</span>
          </div>
          <div className="mb-4"> 
            <div className="text-black font-semibold">Request sent successfully to {toAddress.length === 42 ? toAddress.substring(0, 6) + '...' + toAddress.substring(toAddress.length - 6) : toAddress} on Goerli Base Chain using <span className='text-base-blue'>BasePay</span>!</div>
          </div>
          <div className="ml-0">
          <div className="text-gray-600 font-medium text-lg">
  {requestNote ? `Message: ${requestNote}` : <i>No note added</i>}
</div>

          </div>
          <button className="bg-base-blue shadow-sm drop-shadow text-white text-xl font-medium flex items-center justify-center h-12 w-full rounded-xl focus:outline-none mt-6 mb-0" onClick={() => {
              document.body.style.overflowY = "scroll"; // Remove scroll lock
              document.body.style.minHeight = "0px";
              window.scrollBy(0, -1);
              setShowRequestTransactionModal(false);
              setshowRequestSelectionModal(false);
              setShowRequestModal(false); // Close the success modal
              setCounter('0');
              setToAddress('');
              setrequestNote('');
            }}>
            Continue
          </button>
        </div>
      )}
    </div>
  </div>
)}






    </main>
  );
};

export default Pay;