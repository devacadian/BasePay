import React, { useState } from 'react';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessagePen, faMagnifyingGlass, faArrowLeft } from '@fortawesome/pro-solid-svg-icons';

export default function Messages() {
  const [showModal, setShowModal] = useState(false);

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
  {/* First Bubble */}
  <div className="bg-gray-300 w-14 h-14 rounded-full flex-shrink-0"></div>
  <div className="ml-4 flex flex-col flex-grow">
    <div className="grid grid-cols-[auto,1fr,auto] items-center gap-x-2">
      <p className="text-black text-xl font-semibold mt-1 truncate">Acadian.eth</p>
      <span className="text-black text-sm font-semibold justify-self-end">12h</span>
    </div>
    <div className="grid grid-cols-[1fr,auto] items-center gap-x-2">
      <p className="text-black text-sm truncate overflow-hidden whitespace-nowrap">Hey what are your plans this weekend? test test test this should truncate</p>
      <div className="bg-base-blue w-9 h-6 rounded-xl flex items-center justify-center text-white text-xs">1</div>
    </div>
  </div>
</div>

<div className="flex items-start p-4 mt-0"> {/* Second Bubble with mt-4 */}
  <div className="bg-gray-300 w-14 h-14 rounded-full flex-shrink-0"></div>
  <div className="ml-4 flex flex-col flex-grow">
    <div className="grid grid-cols-[auto,1fr,auto] items-center gap-x-2">
      <p className="text-black text-xl font-semibold mt-1 truncate">0x7bF92...</p>
      <span className="text-black text-sm font-semibold justify-self-end">12h</span>
    </div>
    <div className="grid grid-cols-[1fr,auto] items-center gap-x-2">
      <p className="text-black text-sm truncate overflow-hidden whitespace-nowrap">I was thinking we go out to that new restaurant around the block this weekend!</p>
      <div className="bg-base-blue w-9 h-6 rounded-xl flex items-center justify-center text-white text-xs">27</div>
    </div>
  </div>
</div>

      <div className="bg-white w-full -mb-2"></div>
      <div className="flex-grow flex items-center justify-center">
        {/* You can add other content here */}
      </div>
      <button
        className="bg-base-blue h-14 w-14 flex items-center justify-center rounded-full text-white fixed bottom-36 right-4 z-10"
        onClick={() => setShowModal(true)} // Open modal on click
      >
        <FontAwesomeIcon icon={faMessagePen} className="h-7 w-7" />
      </button>
      <div className="h-24 bg-white w-full absolute bottom-0">

      {showModal && (
  <div className="fixed inset-0 bg-white z-50 flex flex-col">
    <div className="p-4 flex items-center">
      <button onClick={() => setShowModal(false)}> {/* Close modal on click */}
        <FontAwesomeIcon icon={faArrowLeft} className="h-6 w-6 text-black align-middle mt-3" />
      </button>
      <h1 className="text-black text-3xl font-semibold pt-2 ml-4">New Message</h1> {/* Added ml-4 to create space */}
    </div>
    <div className="flex-grow">
      {/* Add your message creation form or other content here */}
    </div>
  </div>
)}
  
        
        {/* Footer content */}
      </div>
    </main>
  );
}