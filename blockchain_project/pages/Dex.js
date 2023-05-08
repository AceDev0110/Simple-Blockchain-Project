import { useEffect, useState} from "react";
import { ethers } from "ethers";
import { token_abi } from "./utils/token_abi";
import { dex_abi } from "./utils/dex_abi";
import styles from '../styles/Home.module.css';

const Dex = ({provider, signer}) => {

const [tokenAmount, setTokenAmount] = useState();
const [ethAmount, setEthAmount] = useState();

const [limitToken, setLimitToken] = useState();
const [limitPrice, setLimitPrice] = useState();

const [marketToken, setMarketToken] = useState();

const [contractDex, setContract] = useState();
const [contractClever, setContractClever] = useState();

const [cleverBalance, setCleverBalance] = useState(0);
const [ethBalance, setEthBalance] = useState(0);

const [buyOrderBook, setBuyOrderBook] = useState([{ amount: 0, price: 0, filled: 0 }]);
const [sellOrderBook, setSellOrderBook] = useState([{ amount: 0, price: 0, filled: 0 }]);

useEffect(() => {
    initContracts();
}, []);

const initContracts = async () => {
    if (typeof window.ethereum !== "undefined") {
        const contractAddress0 = "0xc486eD60e03348A8fE2F477dA49b8F26D9d2AD5A";
        const contractAddress1 = "0x29533859D43e92b3A46A1d42d5E35D8e731A38F2";
        const dex_contract = new ethers.Contract(contractAddress0, dex_abi, signer);
        setContract(dex_contract);
        setContractClever(new ethers.Contract(contractAddress1, token_abi, signer));
        updateTokenUI(dex_contract);
        updateOrderBook(dex_contract);
        updateEthUI(dex_contract);
    }
    else{
        alert("Cannot retrieve contract!")
    }
}

const getTokenFromUI = (event) => {
    setTokenAmount(event.target.value)
}

const getEthFromUI = (event) => {
    setEthAmount(event.target.value)
}

const updateTokenUI = async (contract) => {
    const currTokens = (await contract.balances(signer.getAddress(), ethers.utils.formatBytes32String("CLEVER")));
    setCleverBalance(ethers.utils.formatEther(currTokens));
}

const updateEthUI = async (contract) => {
    const currEths = (await contract.balances(signer.getAddress(), ethers.utils.formatBytes32String("ETH")));
    currEths = ethers.utils.formatEther(currEths);
    setEthBalance((+currEths).toFixed(4));
}

async function updateOrderBook(contract) {

    try{
      const buyOrderBook = await contract.getOrderBook(ethers.utils.formatBytes32String("CLEVER"), 0)
      const sellOrderBook = await contract.getOrderBook(ethers.utils.formatBytes32String("CLEVER"), 1)
      
      let curBuyOrderBook = buyOrderBook.map(({amount, price, filled}) => 
                                             ({amount: amount.toNumber(),
                                               price: ethers.utils.formatEther(price),
                                               filled: filled.toNumber()}));
                                              
      let curSellOrderBook = sellOrderBook.map(({amount, price, filled}) => 
                                               ({amount: amount.toNumber(),
                                                 price: ethers.utils.formatEther(price),
                                                 filled: filled.toNumber()}));
      if(curSellOrderBook.length !=0){
          setSellOrderBook(curSellOrderBook);
      }else {
          setSellOrderBook([{ amount: '---', price: '---', filled: '---' }])
      }
    
      if(curBuyOrderBook.length !=0){
          setBuyOrderBook(curBuyOrderBook);
      }else {
          setBuyOrderBook([{ amount: '---', price: '---', filled: '---' }])
      }
    }catch(e) 
    {
        alert(e)
    }

}

async function depositTokens(){
    if (contractDex && tokenAmount) {
        try {
           const {hash} = await contractDex.depositToken(ethers.utils.parseEther(tokenAmount.toString()), ethers.utils.formatBytes32String("CLEVER"));
           await provider.waitForTransaction(hash);
           updateTokenUI(contractDex);
        }catch(e)
        {
           alert(e);
        }
    }
}

const getLimitToken = (event) => {
    setLimitToken(event.target.value)
}

const getLimitPrice = (event) => {
    setLimitPrice(event.target.value)
}

const getMarketToken = (event) => {
    setMarketToken(event.target.value)
}

async function depositEth(){
    if (contractDex && ethAmount) {
        try {
            const options = {value: ethers.utils.parseEther(ethAmount.toString())}
            const {hash} = await contractDex.depositETH(options);
            await provider.waitForTransaction(hash);
            updateEthUI(contractDex);
        }catch (e)
        {
            alert(e);
        }
    }
}

async function withdrawTokens(){
    if (contractDex && tokenAmount) {
        try {
            const {hash} = await contractDex.withdrawToken(ethers.utils.parseEther(tokenAmount.toString()),ethers.utils.formatBytes32String("CLEVER"));
            await provider.waitForTransaction(hash);
            updateTokenUI(contractDex);
        }catch (e)
        {
            alert(e);
        }
    }
}

async function withdrawEth(){
    if (contractDex && ethAmount) {
        try {
            const {hash} = await contractDex.withdrawETH(ethers.utils.parseEther(ethAmount));
            await provider.waitForTransaction(hash);
            updateEthUI(contractDex);
        }catch(e)
        {
            alert(e);
        }
    }

}

async function createBuyLimitOrder() {
    if (contractDex && limitToken && limitPrice) {
        try {
          const {hash} = await contractDex.createLimitOrder(0/*BUY*/, ethers.utils.formatBytes32String("CLEVER"), limitToken, ethers.utils.parseEther(limitPrice));
          await provider.waitForTransaction(hash);
          updateOrderBook(contractDex);
          updateEthUI(contractDex);
          updateTokenUI(contractDex);
        }catch(e)
        {
          alert(e);
        }
    }
}

async function createSellLimitOrder() {
    if (contractDex && limitToken && limitPrice) {
        try {
          const {hash} = await contractDex.createLimitOrder(1/*SELL*/, ethers.utils.formatBytes32String("CLEVER"), limitToken, ethers.utils.parseEther(limitPrice));
          await provider.waitForTransaction(hash);
          updateOrderBook(contractDex);
          updateEthUI(contractDex);
          updateTokenUI(contractDex);
        }catch(e)
        {
          alert(e);
        }
    }
}

async function buyMarketOrder(){
    if (contractDex && marketToken) {
        try {
            const {hash} = await contractDex.createMarketOrder(0, ethers.utils.formatBytes32String("CLEVER"), marketToken)
            await provider.waitForTransaction(hash);
            updateOrderBook(contractDex);
            updateEthUI(contractDex);
            updateTokenUI(contractDex);
        }catch(e)
        {
           alert(e);
        }
    }
}

async function sellMarketOrder(){
    if (contractDex && marketToken) {
        try {
            const {hash} = await contractDex.createMarketOrder(1, ethers.utils.formatBytes32String("CLEVER"), marketToken)
            await provider.waitForTransaction(hash);
            updateOrderBook(contractDex);
            updateEthUI(contractDex);
            updateTokenUI(contractDex);
        }catch(e)
        {
           alert(e);
        }
    }
}

return (
  <div>
    <h1>DEX</h1>
    <div className={styles.table_title}>
      <h3>DEPOSIT/WITHDRAW</h3>
    </div>
    <table>
      <thead>
        <tr>
          <th align="left">ETH : {ethBalance} </th>
          <th align="left">CP : {cleverBalance} </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <input placeholder="ETH" onChange={getEthFromUI}></input>
          </td>
          <td>
            <input placeholder="CP" onChange={getTokenFromUI}></input>
          </td>
        </tr>
        <tr>
          <td align="center">
            <button onClick={depositEth}>Deposit</button>
            <button onClick={withdrawEth}>Withdraw</button>
          </td>
          <td align="center">
            <button onClick={depositTokens}>Deposit</button>
            <button onClick={withdrawTokens}>Withdraw</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div className={styles.table_title}>
      <h3>LIMIT ORDERS</h3>
    </div>
    <table>
      <thead>
        <tr>
          <th>AMOUNT(CP)</th>
          <th>PRICE(ETH)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <input placeholder="CP" onChange={getLimitToken}></input>
          </td>
          <td>
            <input placeholder="ETH" onChange={getLimitPrice}></input>
          </td>
        </tr>
        <tr>
          <td align="center">
            <button onClick={createBuyLimitOrder}>Buy Limit Order</button>
          </td>
          <td align="center">
            <button onClick={createSellLimitOrder}>Sell Limit Order</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div className={styles.table_title}>
      <h3>MARKET ORDERS</h3>
    </div>
    <table>
      <thead>
        <tr>
          <th>CP</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <input placeholder="CP" onChange={getMarketToken}></input>
          </td>
        </tr>
        <tr>
          <td align="center">
            <button onClick={buyMarketOrder}>Buy</button>
            <button onClick={sellMarketOrder}>Sell</button>
          </td>
        </tr>
      </tbody>
    </table>
    <table className={styles.table_title}>
      <tbody>
      <th align="center">BUY ORDERS</th>
      <th align="center">SELL ORDERS</th>
        <tr>
          <td>
            <table>
              <tbody>
                <tr>
                  {Object.keys(buyOrderBook[0]).map((key) => (
                    <th>{key}</th>
                  ))}
                </tr>
                {buyOrderBook.map((item) => (
                  <tr key={item.amount}>
                    {Object.values(item).map((val) => (
                      <td className={styles.table_orders}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
          <td>
            <table >
              <tbody>
              <tr>
              {Object.keys(sellOrderBook[0]).map((key) => (
                <th>{key}</th>
              ))}
            </tr>
            {sellOrderBook.map((item) => (
              <tr key={item.amount}>
                {Object.values(item).map((val) => (
                  <td className={styles.table_orders}>{val}</td>
                ))}
              </tr>
            ))}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
};

export default Dex;

