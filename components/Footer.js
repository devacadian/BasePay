import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faMessages, faDollarSign, faBell, faUser } from '@fortawesome/pro-solid-svg-icons';
import { useRouter } from 'next/router'; // Import useRouter

const Footer = () => {
  const router = useRouter(); // Use router

  // Determine active tab based on current route
  const activeTab = router.pathname === '/' ? 'home' :
                    router.pathname === '/messages' ? 'messages' :
                    router.pathname === '/notifications' ? 'notifications' :
                    router.pathname === '/profile' ? 'profile' : '';

  return (
    <footer className="fixed bottom-0 left-0 right-0 flex w-full h-24 bg-white text-black items-center justify-around border-t-2 border-blue-500 z-10">
      <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 w-[60px] h-[60px] rounded-full bg-blue-500 border-b-2 border-blue-500 flex items-center justify-center">
        <FontAwesomeIcon icon={faDollarSign} className="w-8 h-8 text-white" />
      </div>
      <Link href="/">
          <div className="flex flex-col items-center font-semibold">
            <FontAwesomeIcon icon={faHouse} className={`pt-1 ${activeTab === 'home' ? 'text-blue-500 w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pt-1 pb-1 ${activeTab === 'home' ? 'text-blue-500' : ''}`}>Home</span>
          </div>
        </Link>
        <Link href="/messages">
          <div className="flex flex-col items-center font-semibold">
            <FontAwesomeIcon icon={faMessages} className={`pt-1 ${activeTab === 'messages' ? 'text-blue-500 w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pb-2 ${activeTab === 'messages' ? 'text-blue-500' : ''}`}>Messages</span>
          </div>
        </Link>
        <Link href="/notifications">
          <div className="flex flex-col items-center font-semibold">
            <FontAwesomeIcon icon={faBell} className={`pt-1 ${activeTab === 'notifications' ? 'text-blue-500 w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'notifications' ? 'text-blue-500' : ''}`}>Notifications</span>
          </div>
        </Link>
        <Link href="/profile">
          <div className="flex flex-col items-center font-semibold">
            <FontAwesomeIcon icon={faUser} className={`pt-1 ${activeTab === 'profile' ? 'text-blue-500 w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'profile' ? 'text-blue-500' : ''}`}>Profile</span>
          </div>
        </Link>
      </footer>
        );
    };
    
    export default Footer;