import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faListCheck, faArrowUpRightFromSquare, faEllipsis } from '@fortawesome/pro-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import Head from 'next/head';
import { useAccount } from "wagmi";
import createIcon from 'blockies';




const Notifications = () => {
  const { address } = useAccount();
  const [paymentRequests, setPaymentRequests] = useState([]);

  const sortedPaymentRequests = paymentRequests.sort((a, b) => b.request_time.seconds - a.request_time.seconds);

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


  

  const AvatarIcon = ({ seed }) => {
    const avatarRef = useRef(null);
  
    useEffect(() => {
      const icon = createIcon({
        seed: seed,
        color: '#000000', // Foreground color
 
        bgcolor: '#ffffff',
        size: 11, // Width/height of the icon in blocks
        scale: 4  // Width/height of each block in pixels
      });
  
      if (avatarRef.current) {
        avatarRef.current.innerHTML = ''; // Clear previous children
        avatarRef.current.appendChild(icon);
      }
    }, [seed]);
    return <div ref={avatarRef} className="ml-0"></div>;
  };
  
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
      {sortedPaymentRequests.map((request, index) => {
          // Convert the request time to a readable format
          const requestDate = new Date(request.request_time.seconds * 1000);
          const now = new Date();
          const timeDifferenceMinutes = Math.floor((now - requestDate) / (60 * 1000));

          let requestTimeString;
          if (timeDifferenceMinutes === 1) {
            requestTimeString = `${timeDifferenceMinutes} min ago`;
          } else if (timeDifferenceMinutes < 60) {
            requestTimeString = `${timeDifferenceMinutes} mins ago`;
          } else {
            const timeDifferenceHours = Math.floor(timeDifferenceMinutes / 60);
            requestTimeString = timeDifferenceHours === 1
              ? `${timeDifferenceHours} hr ago`
              : `${timeDifferenceHours} hrs ago`;
        
            if (timeDifferenceMinutes >= 24 * 60) {
              requestTimeString = requestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
          }
  
          const paymentRequester = request.payment_requester.substring(0, 5) + '...';


          return (
            <div key={index} className="rounded-4xl border-2 border-gray-100 w-full shadow-sm mt-4">
              <div className={"flex items-center" + (!request.transaction_message ? " pb-0 mt-1 " : " mt-0.5 mb-0")}>
              <div className={"relative h-12 w-12 border-2 border-gray-300 rounded-3xl ml-4" + (!request.transaction_message ? " -mb-2" : " -mb-3.5")}>
        <div className="relative w-full h-full overflow-hidden rounded-3xl">
          <AvatarIcon seed={request.payment_requester} />
        </div>
        <div className="bg-green-400 h-2 w-2 rounded-full absolute bottom-0 right-0 mb-0 mr-0"></div>
      </div>
                <div className="ml-4 flex-grow mt-4">
                  <div className={"flex justify-between items-center" + (!request.transaction_message ? " pb-2" : "")}>
                    <span className="text-black font-semibold">Payment Request</span>
                    <span className="text-gray-500 mr-4 font-medium">{requestTimeString}</span>
                  </div>
                  <div className={"flex justify-between items-center " + (!request.transaction_message ? " pb-1" : "mt-1")}>
                    <div className="flex items-center text-black font-semibold">
                      <FontAwesomeIcon icon={faEthereum} className="h-3.5 w-3.5 text-black mr-1 mb-0.5" />
                      <span>{request.ether_amount}</span>
                    </div>
                    <div className="flex items-center text-gray-500 font-medium mr-4">
                      <span>From {paymentRequester}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"flex justify-between text-gray-500 text-sm ml-4.5 mt-3 mb-4 font-semibold mr-4" + (!request.transaction_message ? " -mt-1 mb-4" : "")}>
  <span>
    {request.transaction_message ? (
      <span>
        <span className="text-gray-500">Message:</span> {request.transaction_message}
      </span>
    ) : (
      <span className="text-gray-500 italic">No message sent with request</span>
    )}
  </span>
  <FontAwesomeIcon icon={faEllipsis} className="h-5 w-5 text-gray-400" /> {/* Ellipsis icon */}
</div>
            </div>
          );
                
        })}
      </div>
    </main>
  );
};


export default Notifications;
