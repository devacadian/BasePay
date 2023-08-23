import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAccount } from "wagmi";
import { useBalance } from 'wagmi';
import createIcon from 'blockies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleX, faCopy, faEnvelopeOpenDollar, faMoneyBill, faMoneyBillTransfer, faMoneyBillWave, faMoneyCheckDollarPen, faPaperPlane, faQrcode, faSpinner, faXmark } from '@fortawesome/pro-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import QRCode from 'qrcode.react'; 
import { fetchAllAct  } from '../controller/activitiesFetch'
const etherscanDomain = 'https://api-goerli.basescan.org/'


const Profile = () => {
  const { address } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const { data } = useBalance({ address });
  const [formattedBalance, setFormattedBalance] = useState('0.0000');
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const hasFetchedRef = useRef(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);



  useEffect(() => {
    const balanceValue = parseFloat(data?.formatted || '0.0000');
    setFormattedBalance(balanceValue.toFixed(4));
  }, [data]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    if (address && !hasFetchedRef.current) {
      setIsLoadingActivities(true); // Set loading state to true
  
      const returnAll = async () => {
        const allActivities = await fetchAllAct(etherscanDomain, address);
        setActivities(allActivities);
        setIsLoadingActivities(false); // Set loading state to false after fetching activities
      };
  
      returnAll();
  
      hasFetchedRef.current = true; // Mark as fetched
    }
  }, [address]);
  

  const AvatarIcon = ({ seed }) => {
    const avatarRef = useRef(null);
  
    useEffect(() => {
      const icon = createIcon({
        seed: address,
        color: '#000000', // Foreground color
        bgcolor: '#ffffff',
        size: 11,
        scale: 7.5  // Width/height of each block in pixels
      });
  
      if (avatarRef.current) {
        avatarRef.current.innerHTML = ''; // Clear previous children
        avatarRef.current.appendChild(icon);
      }
    }, [seed]);
    return <div ref={avatarRef} className="-ml-1"></div>;
  };

  const handleRequestPayment = () => {
    router.push('/pay?request=true');
    // You can also send any state or parameters needed to handle the modal on the /pay page
  };


  const handleQRCodeClick = () => {
    setShowQRCodeModal(true);
    document.body.style.overflowY = "hidden"; // Apply scroll lock
  };

  // Function to handle close QR Code modal
const handleCloseQRCodeModal = () => {
  setShowQRCodeModal(false);
  document.body.style.overflowY = "scroll"; // Remove scroll lock
};


const formatTimestamp = (timestamp) => {
  const requestDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  const timeDifferenceMinutes = Math.floor((Date.now() - requestDate) / 1000 / 60);
  let requestTimeString = '';

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

  return requestTimeString;
};


const getIconForActivity = (activityType, activityState) => {
  const displayText = getActivityDisplayText(activityType, activityState);
  switch (displayText) {
    case 'Rejected Request':
      return <FontAwesomeIcon icon={faCircleX} className="h-7.5 w-7.5 text-gray-500" />;
    case 'Request Sent':
      return <FontAwesomeIcon icon={faMoneyBillTransfer} className="h-7.5 w-7.5 text-base-blue" />;
    case 'Request Accepted':
      return <FontAwesomeIcon icon={faEnvelopeOpenDollar} className="h-7.5 w-7.5 text-base-blue" />;
    case 'Payment Sent':
      return <FontAwesomeIcon icon={faMoneyBillWave} className="h-7.5 w-7.5 text-base-blue" />;
    case 'Request Declined':
      return <FontAwesomeIcon icon={faCircleX} className="h-7.5 w-7.5 text-gray-500" />;
    case 'Request Received':
      return <FontAwesomeIcon icon={faMoneyCheckDollarPen} className="h-7.5 w-7.5 text-base-blue" />;
    case 'Request Paid':
      return <FontAwesomeIcon icon={faMoneyBill} className="h-7.5 w-7.5 text-base-blue" />;
    default:
      return <FontAwesomeIcon icon={faEthereum} className="h-7.5 w-7.5 text-base-blue" />; // Default fallback
  }
};



// Function to format the date for grouping
const formatDateForGrouping = (timestamp) => {
  if (timestamp && timestamp.seconds != null && timestamp.nanoseconds != null) {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  }
  return ''; // Default fallback or handling for unexpected timestamp format
};

// Grouping activities by date
const activitiesByDate = activities.reduce((acc, activity) => {
  const date = formatDateForGrouping(activity.timestamp);
  acc[date] = acc[date] ? [...acc[date], activity] : [activity];
  return acc;
}, {});


const getActivityDisplayText = (activityType, activityState) => {
  if (activityType === 'Request Sent' && activityState === 'Rejected') return 'Rejected Request';
  if (activityType === 'Request Sent' && activityState === 'Pending') return 'Request Sent';
  if (activityType === 'Request Sent' && activityState === 'Accepted') return 'Request Accepted';
  if (activityType === 'Payment Sent' && activityState === 'Processed') return 'Payment Sent';
  if (activityType === 'Request Received' && activityState === 'Rejected') return 'Request Declined';
  if (activityType === 'Request Received' && activityState === 'Pending') return 'Request Received';
  if (activityType === 'Request Received' && activityState === 'Processed') return 'Request Paid';
  return activityType; // Default fallback
};

const getCounterPartyPrefix = (activityType, activityState) => {
  const displayText = getActivityDisplayText(activityType, activityState);
  if (['Payment Sent', 'Request Paid', 'Request Sent'].includes(displayText)) {
    return 'To';
  }
  return 'From';
};


  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Head>
        <title>Profile - BasePay</title>
        {/* Add other meta tags as needed */}
      </Head>
      <div className="flex-grow flex items-start justify-center mt-12">
      {isClient && (
        <div className="text-center relative w-full">
          <div className="relative inline-block"> {/* Wrapper for avatar and blue circle */}
          <div className="bg-gray-300 rounded-full h-20 w-20 mb-6 mx-auto overflow-hidden border-2 border-gray-300"
     style={{ maskImage: 'radial-gradient(circle, white, black)' }}>
  <AvatarIcon />
</div>
            <div className="bg-base-blue rounded-full h-8 w-8 absolute bottom-5.5 -right-1 flex items-center justify-center" onClick={handleQRCodeClick}>
                <FontAwesomeIcon icon={faQrcode} className="h-5 w-5 text-white" /> {/* QR code icon */}
              </div>
          </div>
          <div className="flex items-center justify-center text-gray-600 font-bold text-lg ml-11">
            {/* Truncated wallet address */}
            {address ? address.substring(0, 6) + '...' + address.substring(address.length - 6) : null}
            <button onClick={copyToClipboard} className="ml-2 focus:outline-none text-gray-500">
              <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
            </button>
            <a href={`https://goerli.basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer" className="ml-2">
              <img src="/assets/etherscan-logo-circle.svg" alt="Basescan" className="h-4 w-4" />
            </a>
          </div>
          <div className="px-4 mt-6">
            <div className="w-full bg-gray-100 h-20 rounded-3xl flex items-center justify-start shadow-sm drop-shadow-sm p-4">
              <div className="flex justify-center items-center relative w-10 h-10 rounded-full bg-gray-300 shadow drop-shadow-sm ml-4">
                <FontAwesomeIcon icon={faEthereum} className="text-black h-6 w-6 z-10" />
              </div>
              <div className="text-left text-black font-semibold ml-4 flex flex-col">
                <div>{formattedBalance} ETH</div> {/* Display formatted balance */}
                <div className="text-sm text-gray-500 font-semibold">Goerli Basechain Balance</div> {/* Label */}
              </div>
            </div>
          </div>

          <div className="mt-6 px-4 mb-6">
  <div className="text-left text-black font-semibold text-2xl">
    Activity
  </div>
  {isLoadingActivities && (
    <div className="flex justify-center mt-20">
      <FontAwesomeIcon icon={faSpinner} className="text-base-blue h-10 w-10 animate-spin" />
    </div>
  )}
</div>


<div className="px-4 mb-36">
  {isLoadingActivities ? null :
    (Object.keys(activitiesByDate).length === 0 ? (
      <div>
        <div className="text-gray-500 text-2xl font-semibold mt-14">🧾</div>
        <div className="text-black text-xl font-semibold mt-6">No activities yet!</div>
        <div className="text-gray-500 text-base font-semibold mt-2">
          Start using <span className="text-base-blue">BasePay</span> to view activities!
        </div>
      </div>
    ) : (
      Object.keys(activitiesByDate).sort().reverse().map((date, index) => {
        const activitiesForDate = activitiesByDate[date];
        const today = new Date().toISOString().split('T')[0];
        const displayDate = date === today ? "Today" : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

        return (
          <div key={index}>
            <div className="text-left text-black text-base font-semibold mb-6 mt-6">{displayDate}</div>
            {activitiesForDate.map((activity, index) => (
              <div key={index} className="activity-item text-black bg-gray-100 rounded-3xl p-4 mb-5 flex">
                <div className="flex justify-center items-center relative w-12 h-12 rounded-full bg-white drop-shadow-sm mt-1.5 -ml-0.5">
                  {getIconForActivity(activity.activityType, activity.activityState)}
                </div>
                <div className="ml-4 flex flex-col text-left flex-grow mt-1.5 mb-0.5">
                  <div className="flex justify-between">
                    <p className="font-bold inline-block">{getActivityDisplayText(activity.activityType, activity.activityState)}</p>
                    <p className="font-semibold inline-block ml-2 text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="font-semibold inline-block">{activity.amount} ETH</p>
                    <p className="font-semibold inline-block ml-2">{getCounterPartyPrefix(activity.activityType, activity.activityState)} {activity.counterParty.substring(0, 6)}</p>
                  </div>
                  <div className="text-gray-500 font-semibold text-sm"></div>
                </div>
              </div>
            ))}
          </div>
        );
      })
    ))
  }
</div>
</div>

)}

</div>

{/* QR Code Modal */}
{showQRCodeModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-30 bg-opacity-50 bg-black">
    <div className="bg-white p-6 rounded-xl absolute shadow-xl drop-shadow" style={{ maxWidth: 'calc(100% - 2rem)', left: '1rem', right: '1rem' }}> {/* Manual control of width and padding */}
    <button onClick={handleCloseQRCodeModal} className="absolute top-6 left-4">
        <FontAwesomeIcon icon={faXmark} className="h-8 w-8 text-black" />
      </button>
      <div className="text-black text-2xl font-bold text-center mt-10 mb-4">Receive on <span className='text-base-blue'> BasePay</span></div>
      <div className="flex flex-col items-center justify-center mt-6">
        <QRCode value={address} size={128} /> {/* Display the QR code */}
        <div className="text-black text-lg font-bold mt-4">Scan to get address</div>
        <div className="flex items-center justify-center text-gray-600 font-bold text-lg mt-4">
          {/* Truncated wallet address */}
          {address ? address.substring(0, 6) + '...' + address.substring(address.length - 6) : null}
          <button onClick={copyToClipboard} className="ml-2 focus:outline-none text-gray-500">
            <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
          </button>
        </div>
        <button onClick={handleRequestPayment} className="bg-base-blue text-white text-lg font-medium flex items-center justify-center h-12 w-full rounded-3xl focus:outline-none mt-6 mb-2">
  <FontAwesomeIcon icon={faPaperPlane} className="mr-2 h-4 w-4 text-white" />
  Request Payment
</button>
      </div>
    </div>
  </div>
)}


    </main>
  );
};


export default Profile;