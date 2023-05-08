const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Wallet', function(){
    it("should only be possible for owner to add tokens", async () => {
        const [owner, another] = await ethers.getSigners();
    
        const Dex = await ethers.getContractFactory("Dex");
        const Clever = await ethers.getContractFactory("Clever");

        const dex = await Dex.deploy();
        let clever = await Clever.deploy();

        await expect(dex.addToken(ethers.utils.formatBytes32String("CLEVER"), clever.address, {from: owner.address})).to.not.be.reverted;
        await expect(dex.addToken(ethers.utils.formatBytes32String("AAVE"), clever.address, {from: another.address})).to.be.reverted;

    });


    it("should handle deposits correctly", async () => {

        const [owner] = await ethers.getSigners();

        const Dex = await ethers.getContractFactory("Dex");
        const Clever = await ethers.getContractFactory("Clever");

        const dex = await Dex.deploy();
        const clever = await Clever.deploy();

        await expect(dex.addToken(ethers.utils.formatBytes32String("CLEVER"), clever.address, {from: owner.address})).to.not.be.reverted;
        await clever.approve(dex.address,ethers.utils.parseEther("500"));
        await dex.depositToken(ethers.utils.parseEther("100"), ethers.utils.formatBytes32String("CLEVER"));
        
        expect(await dex.balances(owner.address, ethers.utils.formatBytes32String("CLEVER"))).to.equal(ethers.utils.parseEther("100"));
    })
    
    it("should handle correct withdrawals correctly", async () => {

        const [owner] = await ethers.getSigners();

        const Dex = await ethers.getContractFactory("Dex");
        const Clever = await ethers.getContractFactory("Clever");

        let dex = await Dex.deploy()
        let clever = await Clever.deploy()

        await expect(dex.addToken(ethers.utils.formatBytes32String("CLEVER"), clever.address, {from: owner.address})).to.not.be.reverted;
        await clever.approve(dex.address, ethers.utils.parseEther("500"));
        await dex.depositToken(ethers.utils.parseEther("100"), ethers.utils.formatBytes32String("CLEVER"));
        
        await expect(dex.withdrawToken(ethers.utils.parseEther("50"), ethers.utils.formatBytes32String("CLEVER"))).to.not.be.reverted;
    })

});


