import React, { useState, useEffect  } from 'react';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faBarcodeRead, faPaperPlane, faFileInvoice, faXmark, faSpinner, faCircleCheck, faTimesCircle } from '@fortawesome/pro-solid-svg-icons'; // Import icons
import { faClockNine } from '@fortawesome/pro-regular-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import { initiatePayment } from "../controller/contract-control"
import { useAccount } from "wagmi";
import { useBalance } from 'wagmi';
import { useNetwork } from 'wagmi';
import { useChainModal } from '@rainbow-me/rainbowkit'; 


const Pay = () => {
  const [counter, setCounter] = useState('');
  const [formattedBalance, setFormattedBalance] = useState('0.0000'); // State for formatted balance
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data, isLoading } = useBalance({ address });

  const defaultNetworkName = 'Ethereum';
  const chainName = chain?.name || defaultNetworkName;
  const isBaseGoerli = chain?.name === 'Base Goerli';
  const [containerWidth, setContainerWidth] = useState('w-20');
  const { openChainModal } = useChainModal();
  const [isClient, setIsClient] = useState(false);
  const [showModal, setShowModal] = useState(false); // State to control the modal display
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [toAddress, setToAddress] = useState('');
  const [forValue, setForValue] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for the new modal
  const [transactionStatus, setTransactionStatus] = useState(null); // State to track transaction status


  useEffect(() => {
    setContainerWidth(chain?.name === 'Base Goerli' ? 'w-24' : 'w-20');
    setIsClient(true);
  }, []);

  useEffect(() => {
    const balanceValue = parseFloat(data?.formatted || '0.0000');
    setFormattedBalance(balanceValue.toFixed(4));
}, [data]);



  const handleNumberClick = (number) => {
    if (number === '.' && counter.includes('.')) return; // Prevent more than one decimal point
    setCounter(counter + number);
  };

  const handleBackspace = () => {
    setCounter(counter.slice(0, -1));
  };

  const handlePayClick = () => {
    setShowModal(true); // Show the modal when the Pay button is clicked
  };

  const handleCloseModal = () => {
    setShowModal(false); // Hide the modal when the close button is clicked
  };


  const handleOutsideClick = (e) => {
    if (e.target.className.includes('outside-click')) {
      setAnimateModal(true); // Start the animation
      document.body.style.overflowY = "scroll"; // Remove scroll lock
      document.body.style.minHeight = "0px";
      window.scrollBy(0, -1);
      setTimeout(() => {
        setShowPaymentModal(false); // Close the modal after animation completes
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
      setShowPaymentModal(false); // Close the modal after animation completes
      setAnimateModal(false); // Reset the animation state
    }, 300); // 300 milliseconds
  };

  const handleOpenPaymentModal = () => {
    document.body.style.overflowY = "hidden";
    document.body.style.minHeight = "calc(100vh + 1px)";
    window.scrollBy(0, 1);
    setShowPaymentModal(true);
  };

  // Function to close the payment modal
  const handleClosePaymentModal = () => {
    document.body.style.overflowY = "scroll";
    document.body.style.minHeight = "0px";
    window.scrollBy(0, -1);
    setShowPaymentModal(false);
  };


  
  const [touchStartY, setTouchStartY] = useState(0); // State to track the touch start position

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY > touchStartY + 50) { // 50px threshold for swipe-down
      handleClosePaymentModal(); // or handleCloseModal() depending on the modal you want to close
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
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      setShowModal(false);
    } else {
      // Handle failed payment logic here
    }
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
  <div className="bg-gray-100 rounded-full h-7 w-7 flex items-center justify-center"> 
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
          <div className=" bg-gray-100 absolute h-6 w-7 rounded-md"  />
          <FontAwesomeIcon icon={faBarcodeRead} className="h-7 w-7 text-base-blue z-10" />
        </div>
      </div>
      <div className="text-6xl font-semibold mb-4 text-black flex justify-center items-baseline -ml-10 mt-10">
            <FontAwesomeIcon icon={faEthereum} className="mr-0 text-black h-10 w-10" /> {/* Ethereum icon */}
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
        <button className="w-1/2 bg-base-blue text-white text-lg font-medium flex items-center justify-center h-12 rounded-3xl focus:outline-none">
          <FontAwesomeIcon icon={faFileInvoice} className="mr-2 h-4 w-4 text-white" />
          Request
        </button>
      </div>


      
{/* User Selection Modal */}
{showModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-20">
    <div className="bg-white w-full h-full relative pt-2">
      <div className="px-4 pt-0 grid grid-cols-3 items-center">
        <button className="p-4 -ml-4 cursor-pointer" onClick={handleCloseModal}> {/* Close button */}
          <FontAwesomeIcon icon={faXmark} className="h-7 w-7 text-black" />
        </button>
        <div className="text-black text-2xl font-bold flex items-center justify-center"> {/* Centered text */}
          <FontAwesomeIcon icon={faEthereum} className="mr-0 text-black h-5 w-5" /> {/* Ethereum icon */}
          {counter || '0'} {/* Display counter value */}
        </div>
        <div className="flex justify-end"> {/* Confirm Payment button container */}
        <button onClick={handleOpenPaymentModal} className="bg-base-blue text-white text-lg font-medium flex items-center justify-center h-10 w-24 rounded-3xl focus:outline-none">
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2 h-4 w-4 text-white" /> {/* Icon */}
              Pay
            </button>
          </div>
      </div>
      <div className="border-t border-gray-300 mt-2"></div> {/* Thin gray border */}
      <div className="px-4 py-2 flex items-center">
        <label htmlFor="to" className="text-black text-lg font-bold mr-2">To:</label> {/* To: label */}
        <input
  type="text"
  id="to"
  className="rounded p-2 flex-grow ml-1 text-black font-medium outline-none"
  placeholder="Enter ENS or Base address..."
  value={toAddress}
  onChange={(e) => setToAddress(e.target.value.trim())} // Use the trim method here
/>
        <FontAwesomeIcon icon={faBarcodeRead} className="h-6 w-6 text-black ml-2" /> {/* Scan icon */}
      </div>
      <div className="border-t border-gray-300"></div> {/* Thin gray border */}
      <div className="px-4 py-2 flex items-center">
        <label htmlFor="for" className="text-black text-lg font-bold mr-2">For:</label> {/* For: label */}
        <input
      type="text"
      id="for"
      className="rounded p-2 flex-grow text-gray-600 font-medium outline-none"
      placeholder="Add a note"
      value={forValue}
      onChange={(e) => setForValue(e.target.value)} // Update the state with the entered value
    />
      </div>


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

{/* New Payment Modal */}
{showPaymentModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 outside-click" onClick={handleOutsideClick}>
    <div className="bg-black opacity-50 w-full h-full outside-click"></div>
    <div className={`bg-white w-full rounded-t-2xl absolute ${animateModal ? '-bottom-full motion-reduce:transition-all duration-700 ease-in-out' : 'bottom-0'}`}>

      <div className="bg-gray-300 w-18 h-1 mx-auto mt-4 rounded-full cursor-pointer"
           onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} // Adding touch handlers to the gray drag bar
           onClick={handleCloseAnimation}></div> {/* Clickable drag bar */}
      <div className="p-4">
        <div className="flex items-center text-2xl text-black font-bold">
          <FontAwesomeIcon icon={faEthereum} className="mr-2 text-black h-5 w-5" /> {/* Ethereum icon */}
          {counter || '0'} {/* Display counter value */}
        </div>
        <div className="mt-4">
          <div className="bg-gray-300 rounded-3xl w-24 h-12 flex items-center justify-center"> {/* Circle background */}
            <span className="text-gray-600 font-medium text-lg">Pay To</span> {/* Display phrase */}
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
            onClick={handleConfirmPayment} // Updated to use the new handler function
          >
            Confirm
          </button>
      </div>
      {/* Rest of the content for the new payment modal goes here */}
    </div>
  </div>
)}




{/* New Success Modal */}
{showSuccessModal && (
  <div className="fixed top-0 left-0 w-full h-full z-40 flex items-center justify-center">
    <div className="bg-black opacity-50 w-full h-full absolute"></div>
    <div className="bg-white p-4 rounded-xl h-2/3 absolute top-1/6 inset-x-4">
    <button className="p-4 cursor-pointer absolute top-0 left-0" onClick={() => {
        document.body.style.overflowY = "scroll"; // Remove scroll lock
        document.body.style.minHeight = "0px";
        window.scrollBy(0, -1);
        setShowSuccessModal(false); // Close the success modal
      }}> {/* Close button */}
        <FontAwesomeIcon icon={faXmark} className="h-7 w-7 text-black" />
      </button>
      {transactionStatus === 'pending' && (
        <div className="flex items-start justify-start mt-12 ml-0">
          <FontAwesomeIcon icon={faSpinner} className="text-base-blue h-7 w-7 animate-spin" /> {/* Spinner icon */}
          <span className="ml-4 mt-0.5 text-black font-semibold">Transaction in Progress...</span>
        </div>
      )}
    {transactionStatus === 'success' && (
        <div className="mt-12 ml-0">
          <div className="flex items-center justify-start">
            <FontAwesomeIcon icon={faCircleCheck} className="text-base-blue h-7 w-7" /> {/* Success icon */}
            <span className="ml-4 mt-0.5 text-black font-semibold">Transaction Successful!</span>
          </div>
          <div className="ml-2 mt-2">
            <div className="text-black">To: {toAddress}</div>
            <div className="text-black">Value: {counter || '0'}</div>
            <div className="text-black">Note: {forValue || "No note added"}</div>
          </div>
        </div>
      )}
      {transactionStatus === 'fail' && (
        <div className="flex items-start justify-start mt-12 ml-0">
          <FontAwesomeIcon icon={faTimesCircle} className="text-red h-7 w-7" /> {/* Fail icon */}
          <span className="ml-4 mt-0.5 text-black font-semibold">Transaction Failed!</span>
        </div>
      )}
      {/* Rest of the content for the success modal goes here */}
    </div>
  </div>
)}




    </main>
  );
};

export default Pay;