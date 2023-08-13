// Compile contract
// yarn hardhat compile
// Deploy contract
// yarn hardhat run scripts/deploy.js --network baseGoerli

require("dotenv").config()
require("@nomiclabs/hardhat-ethers");

const Private_Key = process.env.PRIVATE_KEY
const QuickNodeUrl = process.env.QUICKNODE_URL 

module.exports = {
  solidity: "0.8.17",
  networks: {
    baseGoerli: {
        url: QuickNodeUrl,
        accounts: [`0x${Private_Key}`],
        gas: 25000000,

    }
  }
};


