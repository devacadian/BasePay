import { ethers } from "ethers"
import { abi } from "./BasePay.json"
const contractAddress = "0x255A1891359A67A50a459e64445E6429f652a23f"

// pass in window.ethereum to this function
// returns back a contract instance
async function connectNode(eth) {
  const provider = new ethers.providers.Web3Provider(eth)
  await provider.send("eth_requestAccounts", [])
  const signer = provider.getSigner()
  // initialize contract instance
  const basePayContractInstance = new ethers.Contract(
    contractAddress,
    abi,
    signer
  )
  return basePayContractInstance
}

// pass in window.ethereum to eth
// note that _etherValue is in Ether NOT Wei
async function initiatePayment(eth, _paymentRecipient, _etherValue) {
    try {
        const basePayContractInstance = await connectNode(eth)
        const txResponse = await basePayContractInstance.initiatePayment(_paymentRecipient, {value: ethers.utils.parseEther(_etherValue)})
        console.log("Transaction Hash: ",txResponse.hash)
        // Wait for the transaction to be mined
        const receipt = await txResponse.wait();

        if (receipt.status === 1) {
            console.log("Transaction successful!");
            return true
        } else {
            console.log("Transaction failed or reverted.");
            return false
        }
    } catch(error) {
        console.log(error.message)
        return false
    }
}

module.exports = {
    initiatePayment
}