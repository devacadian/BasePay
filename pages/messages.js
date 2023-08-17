import React from 'react';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessagePen, faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';

export default function Messages() {
  return (
    <main className="flex flex-col min-h-screen bg-white relative">
      <Head>
        {/* Other head content */}
      </Head>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-black text-3xl font-semibold pt-2 mr-1">Messages</h1>
        </div>
        <button
          onClick={() => {
            // Handle the search action here
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="h-6 w-6 text-black align-middle mt-3" /> {/* Magnifying glass icon */}
        </button>
      </div>
      <div className="bg-white w-full -mb-2"></div>
      <div className="flex-grow flex items-center justify-center">
        {/* You can add other content here */}
      </div>
      <button
        className="bg-base-blue h-12 w-12 flex items-center justify-center rounded-full text-white fixed bottom-36 right-4" // Changed from "absolute" to "fixed"
        onClick={() => {
          // Handle the create message action here
        }}
      >
        <FontAwesomeIcon icon={faMessagePen} className="h-6 w-6" /> {/* Icon size unchanged */}
      </button>
      <div className="h-24 bg-white w-full absolute bottom-0">
        {/* Footer content */}
      </div>
    </main>
  );
}