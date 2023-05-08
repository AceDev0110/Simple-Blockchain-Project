require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: '0.8.8',
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};