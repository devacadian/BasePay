import React from 'react';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessagePen, faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';

export default function Messages() {
  return (
    <main className="flex flex-col min-h-screen bg-white">
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
      <div className="flex items-start p-4">
  <div className="bg-base-blue w-14 h-14 rounded-full flex-shrink-0"></div> {/* Circle */}
  <div className="ml-4 flex flex-col flex-grow relative"> {/* relative positioning */}
    <div className="flex justify-between items-center">
      <p className="text-black text-xl font-semibold mt-1">Acadian.eth</p>
      <span className="text-black text-sm font-semibold mr-1">12h</span> {/* "12h" text */}
    </div>
    <div className="flex">
      <p className="text-black text-sm truncate overflow-hidden whitespace-nowrap" style={{ maxWidth: 'calc(100% - 60px)' }}>Hey what are your plans this weekend?</p> {/* Text with truncation */}
      <div className="bg-base-blue w-9 h-6 rounded-xl flex items-center justify-center text-white text-xs absolute right-0">1</div> {/* Circle with "1" positioned absolutely to the right */}
    </div>
  </div>
</div>
      <div className="bg-white w-full -mb-2"></div>
      <div className="flex-grow flex items-center justify-center">
        {/* You can add other content here */}
      </div>
      <button
        className="bg-base-blue h-14 w-14 flex items-center justify-center rounded-full text-white fixed bottom-36 right-4 z-10" // Changed from "absolute" to "fixed"
        onClick={() => {
          // Handle the create message action here
        }}
      >
        <FontAwesomeIcon icon={faMessagePen} className="h-7 w-7" /> {/* Icon size unchanged */}
      </button>
      <div className="h-24 bg-white w-full absolute bottom-0">
        {/* Footer content */}
      </div>
    </main>
  );
}