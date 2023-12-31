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
  <title>Home - BasePay.app</title>
  <meta name="description" content="Manage payments, send and receive assets, and explore quick actions with BasePay. Experience decentralized payments today!" />
  <link rel="canonical" href="https://www.basepay.app" />
  <meta property="og:title" content="Home - BasePay.app: Your Decentralized Payment Hub" />
  <meta property="og:description" content="BasePay offers a decentralized platform to pay, request, send, and receive assets. Experience fast and secure transactions on the Goerli Base Chain." />
  <meta property="og:url" content="https://www.basepay.app" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Home - BasePay.app: Decentralized Transactions at Your Fingertips" />
  <meta name="twitter:description" content="With BasePay, manage your assets, make payments, and invite others to a decentralized payment experience. Join BasePay today!" />
  <meta name="keywords" content="Crypto, Decentralized, Payments, Wallet, Metamask, BasePay.app, Pay, Request, Message, Invite, Send, Receive, ETH, Base" />
</Head>
    

<div className="px-4 mt-8 mb-0 text-4xl text-center font-semibold text-base-blue"> {/* Quick Actions */}
🔵 BasePay
</div>

      <div className="px-4 mt-6"> 
        <div className="bg-gray-100 h-20 rounded-3xl flex items-center justify-start w-full shadow-sm drop-shadow-sm p-4"> 
          <div className="flex justify-center items-center relative w-10 h-10 rounded-full bg-gray-300 shadow drop-shadow-sm ml-4"> 
            <FontAwesomeIcon icon={faEthereum} className="text-black h-6 w-6 z-10" />
          </div>
          <div className="text-left text-black font-semibold ml-4 flex flex-col">
            <div>{formattedBalance} ETH</div>
            <div className="text-sm text-black font-semibold">Goerli Basechain Balance</div> 
          </div>
        </div>
      </div>




      <div className="px-4 mt-6 mb-4 text-xl font-semibold text-base-blue"> 
  Quick Actions
</div>
<div className="px-4"> 
  <div className="bg-gray-100 p-2 rounded-3xl shadow-sm drop-shadow-sm"> 
    <div className="px-4 mt-2 flex justify-between text-xl text-black"> 
    <div className="flex flex-col items-center cursor-pointer" onClick={handlePayClick}> 
  <div className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm">
    <FontAwesomeIcon icon={faPaperPlane} className="text-white h-5 w-5 z-10" />
  </div>
  <div className="font-semibold text-base">Pay</div>
</div>
      <div className="flex flex-col items-center cursor-pointer" onClick={handleRequestClick}>
      <div
      className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm"
    
    >
          <FontAwesomeIcon icon={faFileInvoice} className="text-white h-5 w-5 z-10" />
        </div>
        <div className="font-semibold text-base">Request</div>
      </div>
      <div className="flex flex-col items-center cursor-pointer" onClick={handleMessageClick}>
  <div className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm">
    <FontAwesomeIcon icon={faMessagePen} className="text-white h-5 w-5 z-10" />
  </div>
  <div className="font-semibold text-base">Message</div>
</div>
      <div className="flex flex-col items-center cursor-pointer" onClick={handleInviteClick}> 
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

<div className="px-4 mt-4 mb-1"> 
  <div className="bg-gray-100 p-2 rounded-2xl shadow-sm drop-shadow-sm text-black text-lg font-semibold text-left px-4"> 
    <div className="mt-2"> 
      Personalize payments <br /> with emojis and messages! 🎉
      <div className="text-black text-base font-semibold mt-8 mb-4"> 
      <span onClick={handleSendETHNowClick} className="bg-base-blue p-2 rounded-2xl text-white px-5 cursor-pointer">
              Send ETH now
            </span>
      </div>
    </div>
  </div>
</div>

<div className="px-4 mt-6 mb-0 text-xl font-semibold text-base-blue"> 
  Receive Assets
</div>
<div className="px-4 mt-4 mb-1"> 
  <div className="bg-gray-100 p-2 rounded-2xl shadow-sm drop-shadow-sm"> 
    <div className="flex justify-end mt-5 mr-4"> 
      <button onClick={handleQRCodeClick} className="text-right text-black flex items-center justify-center focus:outline-none">
        <div className="bg-base-blue rounded-full w-10 h-10 flex items-center justify-center">
          <FontAwesomeIcon icon={faQrcode} className="h-5 w-5 text-white" />
        </div>
      </button>
    </div>
    <div className="px-4 -mt-11 text-black text-md mb-6 font-semibold">
      Send and receive assets on BasePay. <br /> Experience fast and low-cost <br />transactions on Goerli Base Chain.
    </div>
    <div className="mb-4 px-4"> 
      <button
        className="bg-base-blue text-base text-white font-semibold h-10 rounded-2xl w-full flex items-center justify-center"
        onClick={handleCopyAddress} 
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
    <div className="bg-white w-96 p-6 rounded-xl shadow-xl drop-shadow" style={{ maxWidth: 'calc(100% - 2rem)', left: '1rem', right: '1rem' }}>
      <button onClick={handleQRCodeClickClose} className="absolute top-6 left-4">
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>
      <div className="text-black text-2xl font-bold text-center mt-10 mb-4">Receive on <span className='text-base-blue'> BasePay</span></div>
      <div className="flex flex-col items-center justify-center mt-6">
        <QRCode value={address} size={128} /> 
        <div className="text-black text-lg font-bold mt-4">Scan to get address</div>
        <div className="flex items-center justify-center text-gray-600 font-bold text-lg mt-4">
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
        <QRCode value="https://www.basepay.app" size={128} /> 
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