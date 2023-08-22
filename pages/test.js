import React from 'react';
import { queryRequestActivities, queryPaymentReceived, queryPaymentSent, fetchAllAct  } from '../controller/activitiesFetch'
const etherscanDomain = 'https://api-goerli.basescan.org/'

const Test = () => {
  
  async function returnRequestAct() {
    const activities = await queryRequestActivities('0x78Cf17d4Dc15B5e0F40Bd93E2cc902A6b66103fb')
    console.log(activities)
  }


  async function returnPaymnetReceivedAct() {
    const activities = await queryPaymentReceived(etherscanDomain,'0x78cf17d4dc15b5e0f40bd93e2cc902a6b66103fb')
    console.log(activities)
  }

  async function returnPaymentSentAct() {
    const activities = await queryPaymentSent(etherscanDomain,'0x6724A71f5689c51138F2f213E3Bbb00Ffe320A28')
    console.log(activities)
  }

  async function returnAll() {
    const activities = await fetchAllAct(etherscanDomain, '0x6724A71f5689c51138F2f213E3Bbb00Ffe320A28')
    console.log(activities)
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
      <button onClick={returnRequestAct} className="bg-base-blue text-white font-medium rounded-full w-full py-2 mx-1 mb-4 flex items-center justify-center">
        Return All Request Type Activities
      </button>
      <button onClick={returnPaymnetReceivedAct} className="bg-base-blue text-white font-medium rounded-full w-full py-2 mx-1 mb-4 flex items-center justify-center">
        Return Payment Received
      </button>
      <button onClick={returnPaymentSentAct} className="bg-base-blue text-white font-medium rounded-full w-full py-2 mx-1 mb-4 flex items-center justify-center">
        Return Payment Sent
      </button>
      <button onClick={returnAll} className="bg-base-blue text-white font-medium rounded-full w-full py-2 mx-1 flex items-center justify-center">
        Fetch All!!!!!!!!!!!!!!!
      </button>
    </div>
  );
};

export default Test;
