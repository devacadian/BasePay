import React, { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faBarcodeRead, faPaperPlane, faFileInvoice, faMessagePen, faXmark, faUserGroup, faCopy, faQrcode, faShareNodes, faUpRightFromSquare } from '@fortawesome/pro-solid-svg-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useBalance } from 'wagmi';
import { useAccount } from "wagmi";
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import QRCode from 'qrcode.react'; 
import { NotificationContext } from "../components/NotificationProvider";

export default function Home() {
  const { address } = useAccount();
  const { data } = useBalance({ address });
  const [formattedBalance, setFormattedBalance] = useState('0.0000');
  const router = useRouter();
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { showNotification } = useContext(NotificationContext);


  useEffect(() => {
    const balanceValue = parseFloat(data?.formatted || '0.0000');
    setFormattedBalance(balanceValue.toFixed(4));
  }, [data]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address).then(() => {
      showNotification("Address copied to clipboard!", "success");
      // You can add a success message or other behavior here if needed
    });
  };

  const handleRequestClick = () => {
    router.push('/pay?request=true');
  };

  const handlePayClick = () => {
    router.push('/pay');
  };

  const handleMessageClick = () => {
    router.push('/messages?newmessage=true');
  };

  const handleSendETHNowClick = () => {
    router.push('/pay');
  };

  const handleQRCodeClick = () => {
    setShowQRCodeModal(true);
    document.body.style.overflowY = "hidden";
  };

  const handleQRCodeClickClose = () => {
    setShowQRCodeModal(false);
    document.body.style.overflowY = "scroll"; 
  };

  const copyToClipboard = () => {
    showNotification("Copied to clipboard!", "success");
    navigator.clipboard.writeText(address);
  };

  const handleRequestPayment = () => {
    router.push('/pay?request=true');

  };

  const handleInviteClick = () => {
    setShowInviteModal(true);
    document.body.style.overflowY = "hidden";
  };

  const handleInviteModalClose = () => {
    setShowInviteModal(false);
    document.body.style.overflowY = "scroll"; 
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText("https://www.basepay.app").then(() => {
      showNotification("Link copied to clipboard!", "success");
    }).catch((err) => {
      showNotification("Failed to copy the address!", "error");
    });
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
    <div className="bg-white md:rounded-lg shadow-xl flex flex-col overflow-hidden" style={{ width: '500px', height: '812px' }}>
      <main className="flex flex-col bg-white overflow-y-auto">
      <Head>
        {/* Head content */}
      </Head>
    

      <div className="px-4 mt-6"> {/* Container for padding */}
        <div className="bg-gray-100 h-20 rounded-3xl flex items-center justify-start w-full shadow-sm drop-shadow-sm p-4"> {/* Wrapper div */}
          <div className="flex justify-center items-center relative w-10 h-10 rounded-full bg-gray-300 shadow drop-shadow-sm ml-4"> {/* Ethereum logo */}
            <FontAwesomeIcon icon={faEthereum} className="text-black h-6 w-6 z-10" />
          </div>
          <div className="text-left text-black font-semibold ml-4 flex flex-col">
            <div>{formattedBalance} ETH</div> {/* Display formatted balance */}
            <div className="text-sm text-black font-semibold">Goerli Basechain Balance</div> {/* Label */}
          </div>
        </div>
      </div>




      <div className="px-4 mt-6 mb-4 text-xl font-semibold text-base-blue"> {/* Quick Actions */}
  Quick Actions
</div>
<div className="px-4"> {/* Wrapper div for side padding */}
  <div className="bg-gray-100 p-2 rounded-3xl shadow-sm drop-shadow-sm"> {/* Background div for Action Buttons */}
    <div className="px-4 mt-2 flex justify-between text-xl text-black"> {/* Action Buttons */}
    <div className="flex flex-col items-center cursor-pointer" onClick={handlePayClick}> {/* Pay */}
  <div className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm">
    <FontAwesomeIcon icon={faPaperPlane} className="text-white h-5 w-5 z-10" />
  </div>
  <div className="font-semibold text-base">Pay</div>
</div>
      <div className="flex flex-col items-center cursor-pointer" onClick={handleRequestClick}> {/* Request */}
      <div
      className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm"
       // Adding onClick handler
    >
          <FontAwesomeIcon icon={faFileInvoice} className="text-white h-5 w-5 z-10" />
        </div>
        <div className="font-semibold text-base">Request</div>
      </div>
      <div className="flex flex-col items-center cursor-pointer" onClick={handleMessageClick}> {/* Message */}
  <div className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm">
    <FontAwesomeIcon icon={faMessagePen} className="text-white h-5 w-5 z-10" />
  </div>
  <div className="font-semibold text-base">Message</div>
</div>
      <div className="flex flex-col items-center cursor-pointer" onClick={handleInviteClick}> {/* Test */}
        <div className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm">
          <FontAwesomeIcon icon={faUserGroup} className="text-white h-5 w-5 z-10" />
        </div>
        <div className="font-semibold text-base">Invite</div>
      </div>
    </div>
  </div>
</div>


<div className="px-4 mt-8 mb-0 text-xl font-semibold text-base-blue"> {/* Quick Actions */}
  Send Assets
</div>

<div className="px-4 mt-4 mb-1"> {/* Container div */}
  <div className="bg-gray-100 p-2 rounded-2xl shadow-sm drop-shadow-sm text-black text-lg font-semibold text-left px-4"> {/* Inner div */}
    <div className="mt-2"> {/* Margin above the text */}
      Personalize payments <br /> with emojis and messages! 🎉
      <div className="text-black text-base font-semibold mt-8 mb-4"> {/* Additional text */}
      <span onClick={handleSendETHNowClick} className="bg-base-blue p-2 rounded-2xl text-white px-5 cursor-pointer">
              Send ETH now
            </span>
      </div>
    </div>
  </div>
</div>

<div className="px-4 mt-6 mb-0 text-xl font-semibold text-base-blue"> {/* Receive Assets */}
  Receive Assets
</div>
<div className="px-4 mt-4 mb-1"> {/* Container div */}
  <div className="bg-gray-100 p-2 rounded-2xl shadow-sm drop-shadow-sm"> {/* Inner div */}
    <div className="flex justify-end mt-5 mr-4"> {/* QR Code */}
      <button onClick={handleQRCodeClick} className="text-right text-black flex items-center justify-center focus:outline-none">
        <div className="bg-base-blue rounded-full w-10 h-10 flex items-center justify-center"> {/* Blue circle */}
          <FontAwesomeIcon icon={faQrcode} className="h-5 w-5 text-white" />
        </div>
      </button>
    </div>
    <div className="px-4 -mt-11 text-black text-md mb-6 font-semibold"> {/* New text */}
      Send and receive assets on BasePay. <br /> Experience fast and low-cost <br />transactions on Goerli Base Chain.
    </div>
    <div className="mb-4 px-4"> {/* Removed left and right padding */}
      <button
        className="bg-base-blue text-base text-white font-semibold h-10 rounded-2xl w-full flex items-center justify-center"
        onClick={handleCopyAddress} // Add onClick handler here
      >
        <FontAwesomeIcon icon={faCopy} className="mr-2 h-4 w-4" /> Copy Address
      </button>
    </div>
  </div>
</div>



<div className=" -ml-2 flex items-center justify-center mt-4 mb-34 md:mb-10">
  <a
    className="pointer-events-none flex place-items-center gap-2 p-8 pointer-events-auto"
    target="_blank"
    rel="noopener noreferrer"
  >
    {' '}
    <ConnectButton className="dark:invert" width={100} height={24} priority />
  </a>
</div>



{/* QR Code Modal */}
{showQRCodeModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
    <div className="bg-white w-96 p-6 rounded-xl shadow-xl drop-shadow" style={{ maxWidth: 'calc(100% - 2rem)', left: '1rem', right: '1rem' }}> {/* Manual control of width and padding */}
      <button onClick={handleQRCodeClickClose} className="absolute top-6 left-4">
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>
      <div className="text-black text-2xl font-bold text-center mt-10 mb-4">Receive on <span className='text-base-blue'> BasePay</span></div>
      <div className="flex flex-col items-center justify-center mt-6">
        <QRCode value={address} size={128} /> {/* Display the QR code */}
        <div className="text-black text-lg font-bold mt-4">Scan to get address</div>
        <div className="flex items-center justify-center text-gray-600 font-bold text-lg mt-4">
          {/* Truncated wallet address */}
          {address ? address.substring(0, 6) + '...' + address.substring(address.length - 6) : null}
          <button onClick={copyToClipboard} className="ml-2 focus:outline-none text-gray-500">
            <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
          </button>
        </div>
        <button onClick={handleRequestPayment} className="bg-base-blue text-white text-lg font-medium flex items-center justify-center h-12 w-full rounded-3xl focus:outline-none mt-6 mb-2">
  <FontAwesomeIcon icon={faPaperPlane} className="mr-2 h-4 w-4 text-white" />
  Request Payment
</button>
      </div>
    </div>
  </div>
)}

{/* Invite Modal */}
{showInviteModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
    <div className="bg-white p-6 rounded-xl w-96 shadow-xl drop-shadow" style={{ maxWidth: 'calc(100% - 2rem)', left: '1rem', right: '1rem' }}>
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
          <button onClick={handleCopyClick} className="ml-2 focus:outline-none text-gray-500">
  <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
</button>
        </div>
        <button
          className="bg-base-blue text-white text-lg font-medium flex items-center justify-center w-full h-12 rounded-3xl focus:outline-none mt-2 mb-2"
          onClick={handleCopyClick}
        >
                <FontAwesomeIcon icon={faUpRightFromSquare} className="mr-2.5 h-4 w-4 text-white" />
          Copy Invite
        
        </button>
      </div>
    </div>
  </div>
)}

    </main>

    </div>
  </div>
  );
}