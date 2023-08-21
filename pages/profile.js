import React from 'react';
import Head from 'next/head';
import { useAccount } from "wagmi";
import createIcon from 'blockies';


const Profile = () => {
  const { address } = useAccount();

  return (
    <main className="flex flex-col min-h-screen p-0 bg-white">
      <Head>
        <title>Profile - BasePay</title>
        {/* Add other meta tags as needed */}
      </Head>
      <div className="flex-grow flex items-start justify-center mt-20">
        <div className="text-center">
          <div className="bg-gray-300 rounded-full h-20 w-20 mb-6 mx-auto"></div> {/* Gray circle */}
          <div className="text-gray-600 font-bold text-lg">
            {/* Truncated wallet address */}
            {address ? address.substring(0, 6) + '...' + address.substring(address.length - 4) : ''}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;