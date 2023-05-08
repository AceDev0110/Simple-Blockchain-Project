const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Dex', function(){
    it("should throw an error if ETH balance is too low when creating BUY limit order", async () => {
        const [owner] = await ethers.getSigners();

        const Dex = await ethers.getContractFactory("Dex");
        const Clever = await ethers.getContractFactory("Clever");

        const dex = await Dex.deploy();
        let clever = await Clever.deploy();

        await expect(dex.createLimitOrder(0, ethers.utils.formatBytes32String("CLEVER"), clever.address, 10, 1)).to.be.reverted;

        await expect(dex.addToken(ethers.utils.formatBytes32String("CLEVER"), clever.address, {from: owner.address})).to.not.be.reverted;
        await clever.approve(dex.address,ethers.utils.parseEther("500"));
        await dex.depositToken(ethers.utils.parseEther("100"), ethers.utils.formatBytes32String("CLEVER"));
        const options = {value: ethers.utils.parseEther("100")}
        await dex.depositETH(options);
        await expect(dex.createLimitOrder(0, ethers.utils.formatBytes32String("CLEVER"), 10, ethers.utils.parseEther("1"))).to.not.be.reverted;
    });

    it("should throw an error if token balance is too low when creating SELL limit order", async () => {
        const [owner] = await ethers.getSigners();

        const Dex = await ethers.getContractFactory("Dex");
        const Clever = await ethers.getContractFactory("Clever");

        const dex = await Dex.deploy();
        let clever = await Clever.deploy();

        await expect(dex.addToken(ethers.utils.formatBytes32String("CLEVER"), clever.address, {from: owner.address})).to.not.be.reverted;
        await clever.approve(dex.address,ethers.utils.parseEther("500"));
        await dex.depositToken(ethers.utils.parseEther("100"), ethers.utils.formatBytes32String("CLEVER"));
        await expect(dex.createLimitOrder(1, ethers.utils.formatBytes32String("CLEVER"), 500, ethers.utils.parseEther("1"))).to.be.reverted;
    });

    //The SELL order book should be ordered on price from lowest to highest starting at index 0
    it("The SELL order book should be ordered on price from lowest to highest starting at index 0", async () => {
        const [owner] = await ethers.getSigners();

        const Dex = await ethers.getContractFactory("Dex");
        const Clever = await ethers.getContractFactory("Clever");

        const dex = await Dex.deploy();
        let clever = await Clever.deploy();

        await expect(dex.addToken(ethers.utils.formatBytes32String("CLEVER"), clever.address, {from: owner.address})).to.not.be.reverted;
        await clever.approve(dex.address,ethers.utils.parseEther("1000"));
        await dex.depositToken(ethers.utils.parseEther("800"), ethers.utils.formatBytes32String("CLEVER"));

        await dex.createLimitOrder(1, ethers.utils.formatBytes32String("CLEVER"), 1, 300)
        await dex.createLimitOrder(1, ethers.utils.formatBytes32String("CLEVER"), 1, 100)
        await dex.createLimitOrder(1, ethers.utils.formatBytes32String("CLEVER"), 1, 50)

        let orderBook = dex.getOrderBook(ethers.utils.formatBytes32String("CLEVER"), 1)
        for (let i = 0; i < orderBook.length - 1; i++) {
          expect (orderBook[i].marketToken<= orderBook[i+1].marketToken).to.be.revertedWith("Not right order in sell book");
        }
    });  
})


