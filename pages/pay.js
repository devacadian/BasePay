import React, { useState } from 'react';
import Head from 'next/head';

const Pay = () => {
  const [counter, setCounter] = useState('');

  const handleNumberClick = (number) => {
    if (number === '.' && counter.includes('.')) return; // Prevent more than one decimal point
    setCounter(counter + number);
  };

  const handleBackspace = () => {
    setCounter(counter.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center pb-24">
      <Head>
        <title>Payment Page</title>
        <meta name="description" content="Handle payments here" />
      </Head>
      <main className="text-center mt-20">
        <div className="text-4xl font-semibold mb-8 text-black flex justify-center items-baseline -ml-5">
          <span>$</span>
          <span className="text-center">{counter || '0'}</span>
        </div>
        <div className="grid grid-cols-3 gap-x-20 gap-y-10 mb-8 mt-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, '<'].map((number, index) => (
            <button
              key={index}
              className="p-4 rounded-lg focus:outline-none focus:border-blue-300 text-black text-xl font-semibold"
              onClick={() => (number === '<' ? handleBackspace() : handleNumberClick(number))}
            >
              {number}
            </button>
          ))}
        </div>
      </main>
      <div className="w-full flex justify-center space-x-3 px-4">
        <button className="w-1/2 bg-base-blue text-black text-lg font-medium flex items-center justify-center h-12 rounded-3xl focus:outline-none">Pay</button>
        <button className="w-1/2 bg-base-blue text-black text-lg font-medium flex items-center justify-center h-12 rounded-3xl focus:outline-none">Request</button>
      </div>
    </div>
  );
};

export default Pay;
