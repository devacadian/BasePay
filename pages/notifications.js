import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faBells } from '@fortawesome/pro-solid-svg-icons'; // Import the bell icon
import Head from 'next/head';

const Notifications = () => {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Head>

      </Head>
      <div className="p-4 flex items-center">
        <h1 className="text-base-blue text-3xl font-semibold pt-2 mr-1">Notifications</h1>
        <FontAwesomeIcon icon={faBells} className="ml-3 text-base-blue h-10 w-10 mt-2" />
      </div>
      <div className="border-b-2 border-base-blue w-full mb-4"></div>
      <div className="px-4"> 
        <div className="h-25 rounded-4xl border-2 border-gray-100 w-full shadow-md"></div>
        <div className="h-25 rounded-4xl border-2 border-gray-100 w-full shadow-md mt-4"></div>
      </div>
    </main>
  );
};

export default Notifications;
