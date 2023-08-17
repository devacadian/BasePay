import React from 'react';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessagePen } from '@fortawesome/pro-solid-svg-icons';

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
        {/* Other header content can be added here */}
      </div>
      <div className="bg-white w-full -mb-2"></div>
      <div className="flex-grow flex items-center justify-center">
        {/* You can add other content here */}
      </div>
      <button
        className="bg-base-blue h-15 w-15 flex items-center justify-center rounded-full text-white fixed bottom-40 right-4" // Changed from "absolute" to "fixed"
        onClick={() => {
          // Handle the create message action here
        }}
      >
        <FontAwesomeIcon icon={faMessagePen} className="h-7 w-7" /> {/* Adjusted size */}
      </button>
      <div className="h-24 bg-white w-full absolute bottom-0">
        {/* Footer content */}
      </div>
    </main>
  );
}
