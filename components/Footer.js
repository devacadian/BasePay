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
                    router.pathname === '/profile' ? 'profile' :
                    router.pathname === '/pay' ? 'pay' : '';

  return (
    <footer className="fixed bottom-0 left-0 right-0 flex w-full h-24 bg-white text-black items-center justify-around border-t-2 border-base-blue z-10">
  <div className={`absolute top-[-30px] left-1/2 transform -translate-x-1/2 w-[60px] h-[60px] rounded-full bg-base-blue border-b-2 ${activeTab === 'pay' ? 'border-blue-300 shadow-3xl drop-shadow-xl' : 'border-base-blue'} flex items-center justify-center`}>
      <Link href="/pay">
        <FontAwesomeIcon icon={faDollarSign} className="w-8 h-8 text-white" />
           </Link>
      </div>
      <Link href="/">
          <div className="flex flex-col items-center font-semibold pt-1">
            <FontAwesomeIcon icon={faHouse} className={`pt-1 ${activeTab === 'home' ? 'text-base-blue w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'home' ? 'text-base-blue pb-2' : ' pb-0'}`}>Home</span>
          </div>
        </Link>
        <Link href="/messages">
          <div className="flex flex-col items-center font-semibold pt-2">
            <FontAwesomeIcon icon={faMessages} className={` ${activeTab === 'messages' ? 'text-base-blue w-8 h-8' : 'w-6 h-6'}`} />
            <span className={` ${activeTab === 'messages' ? 'text-base-blue pb-2' : ''}`}>Messages</span>
          </div>
        </Link>
        <Link href="/notifications">
          <div className="flex flex-col items-center font-semibold pt-1">
            <FontAwesomeIcon icon={faBell} className={`pt-0 ${activeTab === 'notifications' ? 'text-base-blue w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'notifications' ? 'text-base-blue' : ''}`}>Notifications</span>
          </div>
        </Link>
        <Link href="/profile">
          <div className="flex flex-col items-center font-semibold pt-1">
            <FontAwesomeIcon icon={faUser} className={`pt-1 ${activeTab === 'profile' ? 'text-base-blue w-8 h-8' : 'w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'profile' ? 'text-base-blue' : ''}`}>Profile</span>
          </div>
        </Link>
      </footer>
        );
    };
    
    export default Footer;