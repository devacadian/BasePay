import React from 'react';
import Head from 'next/head';

const Pay = () => {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Payment Page</title>
        <meta name="description" content="Handle payments here" />
      </Head>
      <main className="flex flex-col items-center justify-center">
        {/* Add your content here */}
        <h1 className="text-2xl font-semibold">Payment Page</h1>
      </main>
    </div>
  );
};

export default Pay;
