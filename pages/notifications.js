import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faBells, faListCheck } from '@fortawesome/pro-solid-svg-icons'; // Import the bell icon
import Head from 'next/head';

const Notifications = () => {
    return (
      <main className="flex flex-col min-h-screen bg-white">
        <Head>
          {/* Other head content */}
        </Head>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-base-blue text-3xl font-semibold pt-2 mr-1">Notifications</h1>
            <FontAwesomeIcon icon={faBells} className="ml-3 text-base-blue h-8 w-8 mt-2" /> {/* Bell icon */}
          </div>
          <div className="bg-base-blue rounded-full h-8 w-8 flex items-center justify-center mt-2"> {/* Circle with blue background */}
            <FontAwesomeIcon icon={faListCheck} className="text-white h-4 w-4" /> {/* List check icon */}
          </div>
        </div>
        <div className="border-b-2 border-base-blue w-full mb-4"></div>
        <div className="px-4">
          {['5d ago', '12d ago'].map((time, index) => (
            <div className="flex items-center h-25 rounded-4xl border-2 border-gray-100 w-full shadow-md mt-4">
              <div className="relative h-12 w-12 border-2 border-gray-300 bg-blue-600 rounded-3xl ml-5"> {/* Container for the blue circle */}
                <div className="bg-green-400 h-2 w-2 rounded-full absolute bottom-0 right-0"></div> {/* Small green circle */}
              </div>
              <div className="ml-4 flex-grow">
                <div className="flex justify-between items-center">
                  <span className="text-black font-semibold">{index === 0 ? 'Payment Request' : 'Payment Received'}</span>
                  <span className="text-gray-500 mr-4 font-medium">{time}</span> {/* Text on the far right in the first row */}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black font-semibold">{index === 0 ? '0.0001 ETH' : '0.001 ETH'}</span> {/* ETH amount */}
                  <span className="text-gray-500 font-medium mr-4">From 0x0000...</span> {/* "From" text on the far right */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  };
  
  export default Notifications;