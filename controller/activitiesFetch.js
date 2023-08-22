import axios from 'axios'
const apiKey = '5BYP8B43Q9TU9ESS1GYCA2QRU6BG57Y7RH';
const contractAddress = '0x255A1891359A67A50a459e64445E6429f652a23f';
import { Timestamp } from 'firebase/firestore'
import { ethers } from 'ethers'

// fetch all Request Type Activity from Firestore
async function queryRequestActivities(userAddress) {
    const expressApiUrl = `https://basepay-api.onrender.com/activties/${userAddress}`
    const response = await axios.get(expressApiUrl)
    console.log(response.data)
    return response.data
}

// fetch all Payment Type Activity from Etherscan

// query payment received activities from Etherscan
async function queryPaymentReceived(etherscanDomain, userAddress) {
    
    try {
        const activities = []

        // get txn that userAddress is the receiver
        const internalResponseUserAddress = await axios.get(`${etherscanDomain}api?module=account&action=txlistinternal&address=${userAddress}&startblock=0&endblock=99999999&apikey=${apiKey}`)
        const filteredInternalResponseUserAddress = internalResponseUserAddress.data.result.filter(txn => txn.from.toLowerCase() == contractAddress.toLowerCase())

        // get all normal txn in a contract
        // normal "from" = fund origin
        const normalResponseByContractAddress = await axios.get(`${etherscanDomain}api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&&apikey=${apiKey}`)

        //console.log(internalResponseUserAddress.data)
        //console.log(filteredInternalResponseUserAddress)
        
        //console.log(normalResponseByContractAddress.data)

        for (const txn of filteredInternalResponseUserAddress) {
            
            const { hash, isError, value, timeStamp } = txn

            const unixTimestamp = timeStamp * 1000; // Convert to milliseconds
            const dateObject = new Date(unixTimestamp);
            const firestoreTimestamp = Timestamp.fromDate(dateObject)

            const transaction_state = isError == 0 ? "Processed" : "Failed"

            const from = getFromAddressByHash(normalResponseByContractAddress.data.result, hash)

            if(from == null) {
                continue
            }

            const activity = {
                activityId : hash,
                activityType : "Payment Received",
                activityState : transaction_state,
                counterParty : from,
                amount : ethers.utils.formatEther(value),
                timestamp : firestoreTimestamp
            }

            activities.push(activity)

        }

        console.log(activities)
        return activities

    } catch(error) {
        return error.message
    }
    
}

// query Payment Send Activity from Etherscan
async function queryPaymentSent(etherscanDomain, userAddress) {
    
    try {
        const activities = []
        
        // get internal transaction from the contract
        // @dev update the offset limitation during production
        // query txn by user address
        // normal "from" = fund origin
        //const normalResponse = await axios.get(`${etherscanDomain}api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&&apikey=${apiKey}page=1&offset=15&sort=asc`)
        const normalResponseByUserIdQuery = await axios.get(`${etherscanDomain}api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&&apikey=${apiKey}`)
        // query internal txn by contract address
        // internal "to" = final fund receipent
        const internalResponseByContractAddressQuery = await axios.get(`${etherscanDomain}api?module=account&action=txlistinternal&address=${contractAddress}&startblock=0&endblock=99999999&apikey=${apiKey}`)

        const normalResponseByUserId = normalResponseByUserIdQuery.data.result
        const internalResponseByContractAddress = internalResponseByContractAddressQuery.data.result


        for (const txn of normalResponseByUserId) {
            
            const { hash, isError, value, timeStamp } = txn

            const unixTimestamp = timeStamp * 1000; // Convert to milliseconds
            const dateObject = new Date(unixTimestamp);
            const firestoreTimestamp = Timestamp.fromDate(dateObject)

            const transaction_state = isError == 0 ? "Processed" : "Failed"

            const to = getToAddressByHash(internalResponseByContractAddress, hash)

            if(to == null) {
                continue
            }

            const activity = {
                activityId : hash,
                activityType : "Payment Sent",
                activityState : transaction_state,
                counterParty : to,
                amount : ethers.utils.formatEther(value),
                timestamp : firestoreTimestamp 
            }

            activities.push(activity)

        }

        return activities

    } catch(error) {
        return error.message
    }
    
}

/* ------------------------- Helper Functions ------------------------- */
function getToAddressByHash(transactions, targetHash) {
    const transaction = transactions.find(tx => tx.hash === targetHash);
    if (transaction) {
        return transaction.to;
    } else {
        return null; // Return null if the hash is not found
    }
}

function getFromAddressByHash(transactions, targetHash) {
    const transaction = transactions.find(tx => tx.hash === targetHash);
    if (transaction) {
        return transaction.from;
    } else {
        return null; // Return null if the hash is not found
    }
}

// returns back an array of Activity (Sorted By timestamp)
/*
Activity Object Structure 
{
    "activityId" : "01hlEmQYIz6Dpr8ACpOa" <-- doc ID for DB query, txn hash for ethereum query
    "activityType" : "Payment Sent", <--- enum type (Payment Sent, Payment Reveived, Request Sent, Request Received)
    "activityState" : "Processed", <--- enmu type (Processed , Rejected, Pending)
    "counterParty" : "0x9dD82EE27cc23B343f186756771904E0386973f1" <--- For "Payment Sent" and "Request Sent" it will be the Payment / Request Recipient. For "Payment Received" and "Request Received", its will be the Payment / Request Sender
    "amount" : "0.001",
    "timestamp" : "8/20/2023, 11:01:00 PM" <--- will be request time instead of completion time for "request type". will be txn completion time for "payment type"
}

*/
async function fetchAllAct(etherscanDomain,userAddress) {
    const allAct = []
    const requestAct = await queryRequestActivities(userAddress)
    const paymentReceivedAct = await queryPaymentReceived(etherscanDomain, userAddress)
    const paymentSentAct = await queryPaymentSent(etherscanDomain, userAddress)

    allAct.push(...requestAct, ...paymentReceivedAct, ...paymentSentAct)

    // sort the activities array by timestamp in descending order (latest appears as first)
    allAct.sort((a, b) => {
        const timestampA = a.timestamp.seconds * 1000 + a.timestamp.nanoseconds / 1000000;
        const timestampB = b.timestamp.seconds * 1000 + b.timestamp.nanoseconds / 1000000;
        return timestampB - timestampA;
        });

    console.log(allAct)
    
    return allAct

}

export {
    queryRequestActivities,
    queryPaymentReceived,
    queryPaymentSent,
    fetchAllAct
}