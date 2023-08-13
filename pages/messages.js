import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faMessages, faDollarSign, faBell, faUser, faMagnifyingGlass, faBarcodeRead } from '@fortawesome/pro-solid-svg-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Messages() {
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <main className="flex flex-col min-h-screen p-0 bg-white">
      <div className="px-4 pb-4 pt-6 flex items-center">
        <div className="flex items-center border-2 border-blue-500 rounded-3xl w-full p-2">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="pl-2 mr-2 text-black" />
          <input
            type="text"
            placeholder="Search for an ENS or Base address..."
            className="w-full bg-transparent outline-none"
          />
        </div>
        <FontAwesomeIcon icon={faBarcodeRead} className="ml-4 mr-0 h-8 w-8 text-gray-600" />
      </div>
      <div className="flex-grow flex items-center justify-center">
        <a
          className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
          target="_blank"
          rel="noopener noreferrer"
        >
          {' '}
          <ConnectButton
            className="dark:invert"
            width={100}
            height={24}
            priority
          />
        </a>
      </div>
      <footer className="relative flex w-full h-24 bg-white text-black items-center justify-around border-t-2 border-blue-500 pt-2">
        <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 w-[60px] h-[60px] rounded-full bg-blue-500 border-b-2 border-blue-500 flex items-center justify-center">
          <FontAwesomeIcon icon={faDollarSign} className="w-8 h-8 text-white" />
        </div>
        <Link href="/">
          <div className="flex flex-col items-center font-semibold" onClick={() => setActiveTab('home')}>
            <FontAwesomeIcon icon={faHouse} className={`pt-1 ${activeTab === 'home' ? 'text-blue-500 w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pt-1 pb-1 ${activeTab === 'home' ? 'text-blue-500' : ''}`}>Home</span>
          </div>
        </Link>
        <Link href="/messages">
          <div className="flex flex-col items-center font-semibold" onClick={() => setActiveTab('messages')}>
            <FontAwesomeIcon icon={faMessages} className={`pt-1 ${activeTab === 'messages' ? 'text-blue-500 w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pb-2 ${activeTab === 'messages' ? 'text-blue-500' : ''}`}>Messages</span>
          </div>
        </Link>
        <Link href="/notifications">
          <div className="flex flex-col items-center font-semibold" onClick={() => setActiveTab('notifications')}>
            <FontAwesomeIcon icon={faBell} className={`pt-1 ${activeTab === 'notifications' ? 'text-blue-500 w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'notifications' ? 'text-blue-500' : ''}`}>Notifications</span>
          </div>
        </Link>
        <Link href="/profile">
          <div className="flex flex-col items-center font-semibold" onClick={() => setActiveTab('profile')}>
            <FontAwesomeIcon icon={faUser} className={`pt-1 ${activeTab === 'profile' ? 'text-blue-500 w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'profile' ? 'text-blue-500' : ''}`}>Profile</span>
          </div>
        </Link>
      </footer>
    </main>
  );
}