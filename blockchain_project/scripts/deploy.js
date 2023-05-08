const main = async () => {

    const myNFTFactory = await hre.ethers.getContractFactory('MyNFT');
    const myNFTContract = await myNFTFactory.deploy();
    await myNFTContract.deployed();
    console.log("Contract deployed to:", myNFTContract.address);

    const tokenFactory = await hre.ethers.getContractFactory('Clever');
    const tokenContract = await tokenFactory.deploy();
    await tokenContract.deployed();
    console.log("Contract deployed to:", tokenContract.address);

    const dexFactory = await hre.ethers.getContractFactory('Dex');
    const dexContract = await dexFactory.deploy();
    await dexContract.deployed();
    console.log("Contract deployed to:", dexContract.address);

    await dexContract.addToken(ethers.utils.formatBytes32String("CLEVER"), ethers.utils.getAddress(tokenContract.address));
    await tokenContract.increaseAllowance(ethers.utils.getAddress(dexContract.address), ethers.utils.parseEther("10000"));
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();