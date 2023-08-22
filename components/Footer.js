import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faMessages, faDollarSign, faBell, faUser, faMessagesDollar } from '@fortawesome/pro-solid-svg-icons';
import { useRouter } from 'next/router'; 

const Footer = () => {
  const router = useRouter(); // Use router

  // Determine active tab based on current route
  const activeTab = router.pathname === '/' ? 'home' :
                    router.pathname === '/messages' ? 'messages' :
                    router.pathname === '/notifications' ? 'notifications' :
                    router.pathname === '/profile' ? 'profile' :
                    router.pathname === '/pay' ? 'pay' : 'home';

  return (
    <footer className={`fixed bottom-0 left-0 right-0 flex w-full ${activeTab === 'pay' ? 'h-20' : 'h-24'} bg-white text-black items-center justify-around border-t-2 border-base-blue`}>
 {activeTab !== 'pay' && (
        <div className="absolute top-[-0px] left-1/2 transform -translate-x-1/2 w-[74px] h-[37px] rounded-b-full bg-base-blue  box-shadow: 0 0 0 2px blue-800"></div>
      )}
  <div className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 w-[70px] h-[70px] rounded-full bg-white" ></div>
  <div className={`absolute left-1/2 transform -translate-x-1/2 rounded-full bg-base-blue ${activeTab === 'pay' ? 'border-blue-300 w-[73px] h-[73px] top-[-35px]' : 'border-base-blue w-[60px] h-[60px] top-[-30px] shadow-lg drop-shadow '} flex items-center justify-center`}>
      <Link href="/pay">
      <FontAwesomeIcon icon={faDollarSign} className={`${activeTab === 'pay' ? 'hidden' : 'w-8 h-8'} text-white z-10`} />
      {activeTab === 'pay' && (
        <div className="absolute top-[2px] left-1/2 transform -translate-x-1/2  w-[68px] h-[68px] rounded-full bg-base-blue border-2 border-white flex items-center justify-center">
        <FontAwesomeIcon icon={faDollarSign} className={`${activeTab === 'pay' ? 'w-10 h-10' : 'w-8 h-8'} text-white z-10`} />
      </div>
      )}
           </Link>
      </div>
      <Link href="/">
          <div className="flex flex-col items-center font-semibold pt-1">
            <FontAwesomeIcon icon={faHouse} className={`pt-1 ${activeTab === 'home' ? 'text-base-blue w-8 h-8' : 'text-gray-400 w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'home' ? 'text-base-blue pb-2' : ' text-gray-400 pb-0'}`}>Home</span>
          </div>
        </Link>
        <Link href="/messages">
          <div className="flex flex-col items-center font-semibold pt-2">
            <FontAwesomeIcon icon={faMessagesDollar} className={` ${activeTab === 'messages' ? 'text-base-blue w-8 h-8' : 'text-gray-400 w-6 h-6'}`} />
            <span className={` ${activeTab === 'messages' ? 'text-base-blue pb-2' : 'text-gray-400'}`}>Messages</span>
          </div>
        </Link>
        <Link href="/notifications">
          <div className="flex flex-col items-center font-semibold pt-1">
            <FontAwesomeIcon icon={faBell} className={`pt-0 ${activeTab === 'notifications' ? 'text-base-blue w-8 h-8' : 'text-gray-400 w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'notifications' ? 'text-base-blue' : 'text-gray-400'}`}>Notifications</span>
          </div>
        </Link>
        <Link href="/profile">
          <div className="flex flex-col items-center font-semibold pt-1">
            <FontAwesomeIcon icon={faUser} className={`pt-1 ${activeTab === 'profile' ? 'text-base-blue w-8 h-8' : 'text-gray-400 w-6 h-6'}`} />
            <span className={`pt-1 ${activeTab === 'profile' ? 'text-base-blue' : ' text-gray-400 '}`}>Profile</span>
          </div>
        </Link>
      </footer>
        );
    };
    
    export default Footer;