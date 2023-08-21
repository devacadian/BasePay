import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useAccount } from "wagmi";
import { useBalance } from 'wagmi';
import createIcon from 'blockies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { faQrcode } from '@fortawesome/free-solid-svg-icons'; 
import { faEthereum } from '@fortawesome/free-brands-svg-icons';


const Profile = () => {
  const { address } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const { data } = useBalance({ address });
  const [formattedBalance, setFormattedBalance] = useState('0.0000');


  useEffect(() => {
    const balanceValue = parseFloat(data?.formatted || '0.0000');
    setFormattedBalance(balanceValue.toFixed(4));
  }, [data]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const AvatarIcon = ({ seed }) => {
    const avatarRef = useRef(null);
  
    useEffect(() => {
      const icon = createIcon({
        seed: address,
        color: '#000000', // Foreground color
        bgcolor: '#ffffff',
        size: 11,
        scale: 7.5  // Width/height of each block in pixels
      });
  
      if (avatarRef.current) {
        avatarRef.current.innerHTML = ''; // Clear previous children
        avatarRef.current.appendChild(icon);
      }
    }, [seed]);
    return <div ref={avatarRef} className="-ml-1"></div>;
  };

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Head>
        <title>Profile - BasePay</title>
        {/* Add other meta tags as needed */}
      </Head>
      <div className="flex-grow flex items-start justify-center mt-12">
      {isClient && (
        <div className="text-center relative w-full">
          <div className="relative inline-block"> {/* Wrapper for avatar and blue circle */}
            <div className="bg-gray-300 rounded-full h-20 w-20 mb-6 mx-auto overflow-hidden border-2 border-gray-300">
              <AvatarIcon />
            </div>
            <div className="bg-base-blue rounded-full h-8 w-8 absolute bottom-5.5 -right-1 flex items-center justify-center">
              <FontAwesomeIcon icon={faQrcode} className="h-5 w-5 text-white" /> {/* QR code icon */}
            </div>
          </div>
          <div className="flex items-center justify-center text-gray-600 font-bold text-lg ml-11">
            {/* Truncated wallet address */}
            {address ? address.substring(0, 6) + '...' + address.substring(address.length - 6) : null}
            <button onClick={copyToClipboard} className="ml-2 focus:outline-none text-gray-500">
              <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
            </button>
            <a href={`https://goerli.basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="ml-2">
              <img src="/assets/etherscan-logo-circle.svg" alt="Basescan" className="h-4 w-4" />
            </a>
          </div>
          <div className="px-4 mt-8">
          <div className="w-full bg-gray-100 h-20 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4">
            <div className="flex justify-center items-center relative w-10 h-10 rounded-full bg-gray-300 shadow drop-shadow-sm ml-4">
              <FontAwesomeIcon icon={faEthereum} className="text-black h-6 w-6 z-10" />
            </div>
            <div className="text-left text-black font-semibold ml-4 flex flex-col">
              <div>{formattedBalance} ETH</div> {/* Display formatted balance */}
              <div className="text-sm text-black font-semibold">Goerli Basechain Balance</div> {/* Label */}
            </div>
          </div>
          </div>
        </div>
      )}

      </div>
    </main>
  );
};


export default Profile;