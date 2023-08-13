async function main() {
    const Factory = await ethers.getContractFactory("BasePay")
    const Message = await Factory.deploy()
    await Message.deployed()
  
    console.log("Contract deployed to:", Message.address)
    console.log("Contract deployed by " + JSON.stringify(Message.signer) + " signer")
    process.exit(0)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })