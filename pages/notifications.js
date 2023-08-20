import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faListCheck, faArrowUpRightFromSquare } from '@fortawesome/pro-solid-svg-icons';
import Head from 'next/head';
import { useAccount } from "wagmi";

const Notifications = () => {
  const { address } = useAccount();
  const [paymentRequests, setPaymentRequests] = useState([]);



  useEffect(() => {
    // Function to fetch payment requests
    const fetchPaymentRequests = async () => {
      try {
        // Use the address from useAccount as the connected wallet
        const response = await fetch(`https://basepay-api.onrender.com/get-payment-request/${address}`);
        const data = await response.json();
        setPaymentRequests(data);
      } catch (error) {
        console.error('Error fetching payment requests:', error);
      }
    };

    fetchPaymentRequests();
  }, [address]);




  

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Head>
        {/* Other head content */}
      </Head>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
        <h1 className="text-black text-3xl font-semibold pt-2 mr-1">Notifications</h1>
          <FontAwesomeIcon icon={faBell} className="h-6 w-6 text-black align-middle mt-2 ml-2" />
        </div>
        <div className="bg-base-blue rounded-full h-8 w-8 flex items-center justify-center mt-2">
          <FontAwesomeIcon icon={faListCheck} className="text-white h-4 w-4" />
        </div>
      </div>
      <div className="bg-white w-full -mb-2"></div>
      <div className="px-4">
        {paymentRequests.map((request, index) => {
          // Convert the request time to a readable format
          const requestDate = new Date(request.request_time.seconds * 1000);
          const requestTimeString = requestDate.toLocaleDateString('en-US');

          return (
            <div key={index} className="flex items-center h-25 rounded-4xl border-2 border-gray-100 w-full shadow-sm mt-4">
              <div className="relative h-12 w-12 border-2 border-gray-300 bg-blue-600 rounded-3xl ml-5">
                <div className="bg-green-400 h-2 w-2 rounded-full absolute bottom-0 right-0"></div>
              </div>
              <div className="ml-4 flex-grow">
                <div className="flex justify-between items-center">
                  <span className="text-black font-semibold">Payment Request</span>
                  <span className="text-gray-500 mr-4 font-medium">{requestTimeString}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black font-semibold">{request.ether_amount} ETH</span>
                  <div className="flex items-center text-gray-500 font-medium mr-4">
                    <span>From {request.payment_requester}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};


export default Notifications;
