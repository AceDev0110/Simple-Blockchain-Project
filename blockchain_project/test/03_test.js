const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Dex', function(){
    //When creating a SELL market order, the seller needs to have enough tokens for the trade
    it("Should throw an error when creating a sell market order without adequate token balance", async () => {
        const [owner] = await ethers.getSigners();

        const Dex = await ethers.getContractFactory("Dex");
        const Clever = await ethers.getContractFactory("Clever");

        const dex = await Dex.deploy();
        let clever = await Clever.deploy();
        
        await expect(dex.addToken(ethers.utils.formatBytes32String("CLEVER"), clever.address, {from: owner.address})).to.not.be.reverted;
        await clever.approve(dex.address, ethers.utils.parseEther("500"));
        await dex.depositToken(ethers.utils.parseEther("100"), ethers.utils.formatBytes32String("CLEVER"));

        expect(await dex.balances(owner.address, ethers.utils.formatBytes32String("CLEVER"))).to.equal(ethers.utils.parseEther("100"));
        await expect(dex.createMarketOrder(1, ethers.utils.formatBytes32String("CLEVER"), ethers.utils.parseEther("200"))).to.be.reverted;
        await expect(dex.createMarketOrder(1, ethers.utils.formatBytes32String("CLEVER"), ethers.utils.parseEther("50"))).to.not.be.reverted;
    });


    //Market orders can be submitted even if the order book is empty
    it("Market orders can be submitted even if the order book is empty", async () => {

        const [owner] = await ethers.getSigners();

        const Dex = await ethers.getContractFactory("Dex");
        const Clever = await ethers.getContractFactory("Clever");

        const dex = await Dex.deploy();
        let clever = await Clever.deploy();

        await expect(dex.addToken(ethers.utils.formatBytes32String("CLEVER"), clever.address, {from: owner.address})).to.not.be.reverted;

        const options = {value: ethers.utils.parseEther("500")}
        await dex.depositETH(options);

        let orderbook = await dex.getOrderBook(ethers.utils.formatBytes32String("CLEVER"), 0); 
        expect(orderbook.length == 0, "Buy side Orderbook length is not 0").true;

        await expect(dex.createMarketOrder(0, ethers.utils.formatBytes32String("CLEVER"), 10)).to.not.be.reverted;
    })
})
  

