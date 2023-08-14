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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Head>
        <title>Payment Page</title>
        <meta name="description" content="Handle payments here" />
      </Head>
      <main className="text-center">
        <div className="text-4xl font-semibold mb-8 text-black">$ {counter || '0.00'}</div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, '<'].map((number, index) => (
            <button
              key={index}
              className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 text-black"
              onClick={() => (number === '<' ? handleBackspace() : handleNumberClick(number))}
            >
              {number}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Pay;