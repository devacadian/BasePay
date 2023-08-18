import { ethers } from "ethers"
import { abi } from "./BasePay.json"
const contractAddress = "0x255A1891359A67A50a459e64445E6429f652a23f"

// pass in window.ethereum to this function
// returns back a contract instance
async function connectNode(eth) {
    if (eth?.enable) {
      await eth.enable(); // Ensure connectivity with the wallet
    }
    const provider = new ethers.providers.Web3Provider(eth);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const basePayContractInstance = new ethers.Contract(
      contractAddress,
      abi,
      signer
    );
    return basePayContractInstance;
  }

// pass in window.ethereum to eth
// note that _etherValue is in Ether NOT Wei
async function initiatePayment(eth, _paymentRecipient, _etherValue, callback) {
    try {
        const basePayContractInstance = await connectNode(eth);
        const txResponse = await basePayContractInstance.initiatePayment(_paymentRecipient, {
            value: ethers.utils.parseEther(_etherValue),
            // gasLimit: 29000 // Setting a low gas limit to intentionally fail the transaction
        });
  
        console.log("Transaction Hash: ", txResponse.hash);
  
        // Return the transaction hash immediately
        const txHash = txResponse.hash;
  
        // Wait for the transaction to be mined
        txResponse.wait().then(receipt => {
            if (receipt) {
                if (receipt.status === 1) {
                    console.log("Transaction successful!");
                } else {
                    console.log("Transaction failed or reverted.");
                }
                // Call the callback with the receipt if provided
                if (callback) callback(receipt);
            } else {
                console.log("Receipt is null or undefined.");
                if (callback) callback({status: 0}); // Call the callback with a failure status
            }
        }).catch(error => {
            // Handle the error here
            console.log("Transaction failed with an exception:", error.message);
            if (callback) callback({status: 0}); // Call the callback with a failure status
        });
  
        return txHash;
    } catch(error) {
        console.log(error.message);
        return null;
    }
  }

module.exports = {
    initiatePayment
};