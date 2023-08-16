import React, { useState, useEffect  } from 'react';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faBarcodeRead, faPaperPlane, faFileInvoice, faChevronLeft, faMagnifyingGlass, faXmark } from '@fortawesome/pro-solid-svg-icons'; // Import icons
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

  const handleDragStart = (e) => {
    e.dataTransfer.setDragImage(new Image(), 0, 0);
  };

  const handleDragEnd = () => {
    setShowPaymentModal(false); // Close the new payment modal when dragged down
  };

  const handleConfirmPaymentClick = () => {
    setShowPaymentModal(true); // Show the new payment modal when Confirm Payment button is clicked
  };

  const handleOutsideClick = (e) => {
    if (e.target.className.includes('outside-click')) {
      setShowPaymentModal(false); // Close the new payment modal when clicked outside of it
    }
  };

  const [animateModal, setAnimateModal] = useState(false);

  const handleCloseAnimation = () => {
    setAnimateModal(true); // Start the animation
    setTimeout(() => {
      setShowPaymentModal(false); // Close the modal after animation completes
      setAnimateModal(false); // Reset the animation state
    }, 300); // 300 milliseconds
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
            <button onClick={handleConfirmPaymentClick} className="bg-base-blue text-white text-lg font-medium flex items-center justify-center h-10 w-24 rounded-3xl focus:outline-none">
              <FontAwesomeIcon icon={faPaperPlane} className="mr-2 h-4 w-4 text-white" /> {/* Icon */}
              Pay
            </button>
          </div>
      </div>
      <div className="border-t border-gray-300 mt-2"></div> {/* Thin gray border */}
      <div className="px-4 py-2 flex items-center">
        <label htmlFor="to" className="text-black text-lg font-bold mr-2">To:</label> {/* To: label */}
        <input type="text" id="to" className="rounded p-2 flex-grow ml-1 text-black font-medium outline-none" placeholder="Enter ENS or Base address..." /> {/* Entry box */}
        <FontAwesomeIcon icon={faBarcodeRead} className="h-6 w-6 text-black ml-2" /> {/* Scan icon */}
      </div>
      <div className="border-t border-gray-300"></div> {/* Thin gray border */}
      <div className="px-4 py-2 flex items-center">
        <label htmlFor="for" className="text-black text-lg font-bold mr-2">For:</label> {/* For: label */}
        <input type="text" id="for" className="rounded p-2 flex-grow text-black font-medium outline-none" placeholder="Add a note" /> {/* Entry box */}
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
          <div
            className={`bg-white w-full h-1/2 rounded-t-lg absolute ${animateModal ? 'top-full transition-all duration-300 ease-in-out' : 'top-1/2'}`}
          >
            <div className="bg-gray-300 w-16 h-1 mx-auto mt-2 rounded-full cursor-pointer" onClick={handleCloseAnimation}></div> {/* Clickable drag bar */}
            {/* Content of the new payment modal goes here */}
          </div>
        </div>
      )}
    </main>
  );
};


export default Pay;