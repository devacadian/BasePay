import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faBarcodeRead, faPaperPlane, faFileInvoice, faMessagePen, faShareFromSquare, faUserGroup, faCopy, faQrcode } from '@fortawesome/pro-solid-svg-icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useBalance } from 'wagmi';
import { useAccount } from "wagmi";
import { faEthereum } from '@fortawesome/free-brands-svg-icons';


export default function Home() {
  const { address } = useAccount();
  const { data } = useBalance({ address });
  const [formattedBalance, setFormattedBalance] = useState('0.0000');

  useEffect(() => {
    const balanceValue = parseFloat(data?.formatted || '0.0000');
    setFormattedBalance(balanceValue.toFixed(4));
  }, [data]);

  return (
    <main className="flex flex-col min-h-screen bg-white">
      <Head>
        {/* Head content */}
      </Head>
      <div className="pb-8 pt-6 px-4 flex items-center">
        <div className="flex items-center border-2 border-blue-500 rounded-3xl w-full p-2">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="pl-2 mr-2 text-black w-6 h-6" />
          <input
            type="text"
            placeholder="Search for an ENS or Base address..."
            className="w-full bg-transparent outline-none"
          />
        </div>
        <FontAwesomeIcon icon={faBarcodeRead} className="ml-4 mr-0 h-8 w-8 text-gray-600" />
      </div>
      <div className="px-4"> {/* Container for padding */}
        <div className="bg-gray-100 h-20 rounded-3xl flex items-center justify-start w-full shadow-sm drop-shadow-sm p-4"> {/* Wrapper div */}
          <div className="flex justify-center items-center relative w-10 h-10 rounded-full bg-gray-300 shadow drop-shadow-sm ml-4"> {/* Ethereum logo */}
            <FontAwesomeIcon icon={faEthereum} className="text-black h-6 w-6 z-10" />
          </div>
          <div className="text-left text-black font-semibold ml-4 flex flex-col">
            <div>{formattedBalance} ETH</div> {/* Display formatted balance */}
            <div className="text-sm text-black font-semibold">Goerli Basechain Balance</div> {/* Label */}
          </div>
        </div>
      </div>




      <div className="px-4 mt-6 mb-4 text-xl font-semibold text-base-blue"> {/* Quick Actions */}
  Quick Actions
</div>
<div className="px-4"> {/* Wrapper div for side padding */}
  <div className="bg-gray-100 p-2 rounded-3xl shadow-sm drop-shadow-sm"> {/* Background div for Action Buttons */}
    <div className="px-4 mt-2 flex justify-between text-xl text-black"> {/* Action Buttons */}
      <div className="flex flex-col items-center"> {/* Pay */}
        <div className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm">
          <FontAwesomeIcon icon={faPaperPlane} className="text-white h-5 w-5 z-10" />
        </div>
        <div className="font-semibold text-base">Pay</div>
      </div>
      <div className="flex flex-col items-center"> {/* Request */}
        <div className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm">
          <FontAwesomeIcon icon={faFileInvoice} className="text-white h-5 w-5 z-10" />
        </div>
        <div className="font-semibold text-base">Request</div>
      </div>
      <div className="flex flex-col items-center"> {/* Share */}
        <div className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm">
          <FontAwesomeIcon icon={faMessagePen} className="text-white h-5 w-5 z-10" />
        </div>
        <div className="font-semibold text-base">Message</div>
      </div>
      <div className="flex flex-col items-center"> {/* Test */}
        <div className="flex justify-center items-center relative w-12 h-12 mb-2 rounded-full bg-base-blue shadow drop-shadow-sm">
          <FontAwesomeIcon icon={faUserGroup} className="text-white h-5 w-5 z-10" />
        </div>
        <div className="font-semibold text-base">Invite</div>
      </div>
    </div>
  </div>
</div>


<div className="px-4 mt-6 mb-0 text-xl font-semibold text-base-blue"> {/* Quick Actions */}
  Send Assets
</div>

<div className="px-4 mt-4 mb-1"> {/* Container div */}
  <div className="bg-gray-100 p-2 rounded-3xl shadow-sm drop-shadow-sm text-black text-lg font-semibold text-left px-4"> {/* Inner div */}
    <div className="mt-2"> {/* Margin above the text */}
      Personalize payments <br /> with emojis and messages! 🎉
      <div className="text-black text-base font-semibold mt-8 mb-4"> {/* Additional text */}
        <span className="bg-base-blue p-2 rounded-2xl text-white px-5">Send ETH now</span>
      </div>
    </div>
  </div>
</div>

<div className="px-4 mt-6 mb-0 text-xl font-semibold text-base-blue"> {/* Receive Assets */}
  Receive Assets
</div>
<div className="px-4 flex justify-end -mt-0 mb-0"> {/* QR Code */}
  <div className="text-right text-black flex items-center justify-center">
    <div className="bg-base-blue rounded-full w-10 h-10 flex items-center justify-center"> {/* Blue circle */}
      <FontAwesomeIcon icon={faQrcode} className="h-5 w-5 text-white" />
    </div>
  </div>
</div>
<div className="px-4  -mt-6 text-black text-md mb-6 font-semibold"> {/* New text */}
  Send and receive assets on BasePay. <br /> Experience fast and low-cost transactions <br /> on Goerli Base Chain.
</div>

<div className="mb-4 px-4"> {/* Removed left and right padding */}
  <button className="bg-base-blue text-base text-white font-semibold h-10 rounded-2xl w-full flex items-center justify-center"> {/* Copy Address Button */}
    <FontAwesomeIcon icon={faCopy} className="mr-2 h-4 w-4" /> Copy Address
  </button>
</div>




<div className=" -ml-2 flex items-center justify-center mt-4 mb-34">
  <a
    className="pointer-events-none flex place-items-center gap-2 p-8 pointer-events-auto"
    target="_blank"
    rel="noopener noreferrer"
  >
    {' '}
    <ConnectButton className="dark:invert" width={100} height={24} priority />
  </a>
</div>


    </main>
  );
}