// SPDX-License-Identifier: MIT

pragma solidity >=0.8.8;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721URIStorage{

     using Counters for Counters.Counter;
     Counters.Counter private _tokenIds;

    constructor() ERC721 ("CleverProgrammer","CP") {
        console.log("Clever Programmer NFT");
    }

    function mintNFT(string memory metadata) public {

    uint256 newItemId = _tokenIds.current();

    _safeMint(msg.sender, newItemId);
    _setTokenURI(newItemId, metadata);
    
    console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
    _tokenIds.increment();
    }
}