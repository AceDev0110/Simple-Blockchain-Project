// SPDX-License-Identifier: MIT

pragma solidity >=0.8.8;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable {
    using SafeMath for uint256;

struct Token {
    bytes32 token_id;
    address token_address;
}

    mapping(bytes32 => Token) public tokenMapping;
    bytes32[] public tokenList;

    mapping(address => mapping(bytes32 => uint256)) public balances;
    
    function addToken(bytes32 token_id, address token_address) onlyOwner external {
        tokenMapping[token_id] = Token(token_id, token_address);
        tokenList.push(token_id);
    }

    function depositToken(uint amount, bytes32 token_id) external {
        require(tokenMapping[token_id].token_address != address(0)); 
        IERC20(tokenMapping[token_id].token_address).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][token_id] = balances[msg.sender][token_id].add(amount);
    }
    
    function withdrawToken(uint amount, bytes32 token_id) external {
        require(tokenMapping[token_id].token_address != address(0)); 
        require(balances[msg.sender][token_id] >= amount, "Not enough balance");

        balances[msg.sender][token_id] = balances[msg.sender][token_id].sub(amount);
        IERC20(tokenMapping[token_id].token_address).transfer(msg.sender, amount);
    }

    function depositETH() payable public {
        require(msg.sender.balance >= msg.value && msg.value > 0, "Not enough ETH");
        balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].add(msg.value);
    }
    
    function withdrawETH(uint amount)  external returns (bool success) {
        require(balances[msg.sender]["ETH"] >= amount, "Not enough balance!");
        balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].sub(amount);
        ( success, ) = msg.sender.call{value: (amount)}("");
        require(success, "Failed to send Ether");
    }
}

