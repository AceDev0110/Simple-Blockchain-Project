// SPDX-License-Identifier: MIT

pragma solidity >=0.8.8;
pragma experimental ABIEncoderV2;

import "./Wallet.sol";

contract Dex is Wallet {

    using SafeMath for uint256;

constructor() {
    }
    enum Side {
       BUY,
       SELL
    }

    struct Order {
       uint id;
       address trader;
       Side side;
       bytes32 token_id;
       uint amount;
       uint price;
       uint filled;
    }

uint public nextOrderId = 0;

mapping(bytes32 => mapping(uint => Order[])) public orderBook;

function getOrderBook(bytes32 token_id, Side side) view public returns(Order[] memory){
        return orderBook[token_id][uint(side)];
}

function createLimitOrder(Side side, bytes32 token_id, uint amount, uint price) public{

        if(side == Side.BUY){
            require(balances[msg.sender]["ETH"] >= amount.mul(price), "Not enough ETH");
        }
        else if(side == Side.SELL){
            require(balances[msg.sender][token_id] >= amount *(10**18)) ;
        }

        Order[] storage orders = orderBook[token_id][uint(side)];
        orders.push(Order(nextOrderId, msg.sender, side, token_id, amount, price, 0));
        
        uint i = orders.length > 0 ? orders.length - 1 : 0;
        if(side == Side.BUY){
            while(i > 0){
                if(orders[i - 1].price > orders[i].price) {
                    break;
                }
                Order memory orderToMove = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        }
        else if(side == Side.SELL){
            while(i > 0){
                if(orders[i - 1].price < orders[i].price) {
                    break;   
                }
                Order memory orderToMove = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        }
        nextOrderId++;
    }

function createMarketOrder(Side side, bytes32 token_id, uint amount) public{
        if(side == Side.SELL){
            require(balances[msg.sender][token_id] >= amount, "Insuffient balance");
        }

        uint orderBookSide;
        if(side == Side.BUY){
            orderBookSide = 1;
        }
        else{
            orderBookSide = 0;
        }
        Order[] storage orders = orderBook[token_id][orderBookSide];

        uint totalFilled = 0;

        for (uint256 i = 0; i < orders.length && totalFilled < amount; i++) {
            uint leftToFill = amount.sub(totalFilled);
            uint availableToFill = orders[i].amount.sub(orders[i].filled);
            uint filled = 0;
            if(availableToFill > leftToFill){
                filled = leftToFill;
            }
            else{ 
                filled = availableToFill;
            }

            totalFilled = totalFilled.add(filled);
            orders[i].filled = orders[i].filled.add(filled);
            uint cost = filled.mul(orders[i].price);

            if(side == Side.BUY){
                require(balances[msg.sender]["ETH"] >= cost);
                balances[msg.sender][token_id] = balances[msg.sender][token_id].add(filled *(10**18));
                balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].sub(cost);
                
                balances[orders[i].trader][token_id] = balances[orders[i].trader][token_id].sub(filled *(10**18));
                balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].add(cost);
            }
            else if(side == Side.SELL){
                balances[msg.sender][token_id] = balances[msg.sender][token_id].sub(filled*(10**18));
                balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].add(cost);
                
                balances[orders[i].trader][token_id] = balances[orders[i].trader][token_id].add(filled *(10**18));
                balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].sub(cost);
            }
        }

        while(orders.length > 0 && orders[0].filled == orders[0].amount){
            for (uint256 i = 0; i < orders.length - 1; i++) {
                orders[i] = orders[i + 1];
            }
            orders.pop();
        }
        
    }

}
