const axios = require('axios');
const { ethers } = require("ethers") 
const { Timestamp } = require("firebase/firestore");

const apiKey = '5BYP8B43Q9TU9ESS1GYCA2QRU6BG57Y7RH';
const contractAddress = '0x255A1891359A67A50a459e64445E6429f652a23f';
const etherscanDomain = 'https://api-goerli.basescan.org/'

// query all transaction within the contract
async function queryAllTxn(etherscanDomain, userAddress) {

    // get internal transaction from the contract
    // @dev update the offset limitation during production
    // query txn by user address
    // normal "from" = fund origin
    //const normalResponse = await axios.get(`${etherscanDomain}api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&&apikey=${apiKey}page=1&offset=15&sort=asc`)
    const normalResponseByUserId = await axios.get(`${etherscanDomain}api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&&apikey=${apiKey}`)
    // query internal txn by contract address
    // internal "to" = final fund receipent
    const internalResponseByContractAddress = await axios.get(`${etherscanDomain}api?module=account&action=txlistinternal&address=${contractAddress}&startblock=0&endblock=99999999&apikey=${apiKey}`)
    

    const result = {
        normalResponseByUserId : normalResponseByUserId.data.result,
        internalResponseByContractAddress : internalResponseByContractAddress.data.result
    }

    //console.log(result.normalTxn)
    //console.log(result.normalTxn.length)
    //console.log(result.internalTxn.length)
    return result

}

// query Payment Send Activity
async function queryPaymentSent(etherscanDomain, userAddress) {
    
    try {
        const activities = []
        const { normalResponseByUserId, internalResponseByContractAddress } = await queryAllTxn(etherscanDomain, userAddress)

        for (const txn of normalResponseByUserId) {
            
            const { hash, isError, value, timeStamp } = txn

            const firestoreTimestamp = Timestamp.fromMillis(timeStamp * 1000)

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

// query Payment Received Activity
async function queryPaymentReceived(etherscanDomain, userAddress) {
    
    try {
        const activities = []
        //const { normalResponseByUserId, internalResponseByContractAddress } = await queryAllTxn(etherscanDomain, userAddress)

        // get txn that userAddress is the receiver
        const internalResponseUserAddress = await axios.get(`${etherscanDomain}api?module=account&action=txlistinternal&address=${userAddress}&startblock=0&endblock=99999999&apikey=${apiKey}`)
        const filteredInternalResponseUserAddress = internalResponseUserAddress.data.result.filter(txn => txn.from.toLowerCase() == contractAddress.toLowerCase())

        // get all normal txn in a contract
        // normal "from" = fund origin
        const normalResponseByUserId = await axios.get(`${etherscanDomain}api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&&apikey=${apiKey}`)

        //console.log(filteredInternalResponseUserAddress)
        //console.log(internalResponseUserAddress.data.result)

        for (const txn of filteredInternalResponseUserAddress) {
            
            const { hash, isError, value, timeStamp } = txn

            const firestoreTimestamp = Timestamp.fromMillis(timeStamp * 1000)

            const transaction_state = isError == 0 ? "Processed" : "Failed"

            const from = getFromAddressByHash(normalResponseByUserId.data.result, hash)

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


module.exports = {
    queryPaymentSent,
    queryPaymentReceived
}


queryPaymentReceived(etherscanDomain, '0xAB60DdFE027D9D86C836e8e5f9133578E102F720')
    .then(console.log)


//queryAllTxn(etherscanDomain,'0x6724A71f5689c51138F2f213E3Bbb00Ffe320A28').then(console.log)
//queryPaymentSent(etherscanDomain, '0x6724A71f5689c51138F2f213E3Bbb00Ffe320A28')
//    .then(console.log)