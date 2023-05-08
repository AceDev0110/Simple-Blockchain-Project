// SPDX-License-Identifier: MIT

pragma solidity >=0.8.8;
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Clever is ERC20{
    constructor() ERC20("Clever_Pro", "CP") { 
        _mint(msg.sender, 10000*(10 ** uint256(decimals())));
    }
}