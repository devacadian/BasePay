import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBells, faListCheck, faArrowUpRightFromSquare } from '@fortawesome/pro-solid-svg-icons';
import Head from 'next/head';

const Notifications = () => {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Head>
        {/* Other head content */}
      </Head>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-black text-3xl font-semibold pt-2 mr-1">Notifications</h1>
        </div>
        <div className="bg-base-blue rounded-full h-8 w-8 flex items-center justify-center mt-2">
          <FontAwesomeIcon icon={faListCheck} className="text-white h-4 w-4" />
        </div>
      </div>
      <div className="bg-white w-full -mb-2"></div>
      <div className="px-4">
        {['5d ago', '12d ago'].map((time, index) => (
          <div key={time} className="flex items-center h-25 rounded-4xl border-2 border-gray-100 w-full shadow-md mt-4">
            <div className="relative h-12 w-12 border-2 border-gray-300 bg-blue-600 rounded-3xl ml-5">
              <div className="bg-green-400 h-2 w-2 rounded-full absolute bottom-0 right-0"></div>
            </div>
            <div className="ml-4 flex-grow">
              <div className="flex justify-between items-center">
                <span className="text-black font-semibold">{index === 0 ? 'Payment Request' : 'Payment Received'}</span>
                <span className="text-gray-500 mr-4 font-medium">{time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black font-semibold">{index === 0 ? '0.0001 ETH' : '0.001 ETH'}</span>
                <div className="flex items-center text-gray-500 font-medium mr-4">
                  <span>From 0x0000...</span>
                  {index === 1 && <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-2 text-gray-500 h-4 w-4" />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Notifications;
