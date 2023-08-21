import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useAccount } from "wagmi";
import createIcon from 'blockies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const { address } = useAccount();
  const [isClient, setIsClient] = useState(false);

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
    <main className="flex flex-col min-h-screen p-0 bg-white">
      <Head>
        <title>Profile - BasePay</title>
        {/* Add other meta tags as needed */}
      </Head>
      <div className="flex-grow flex items-start justify-center mt-16">
        {isClient && (
          <div className="text-center">
            <div className="bg-gray-300 rounded-full h-20 w-20 mb-6 mx-auto overflow-hidden border-2 border-gray-300">
              <AvatarIcon />
            </div> {/* Gray circle */}
            <div className="flex items-center justify-center text-gray-600 font-bold text-lg ml-10">
              {/* Truncated wallet address */}
              {address ? address.substring(0, 6) + '...' + address.substring(address.length - 6) : null}
              <button onClick={copyToClipboard} className="ml-2 focus:outline-none text-gray-500">
                <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
              </button>
              <a href={`https://goerli.basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="ml-2">
                <img src="/assets/etherscan-logo-circle.svg" alt="Basescan" className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};


export default Profile;