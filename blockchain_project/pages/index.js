import {useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import {ethers } from "ethers";
import Minters from './Minter.js';
import Dex from './Dex.js';
import { abi } from './utils/abi.js';

export default function Home() {

  const [isConnected, setIsConnected] = useState();
  const [signer, setSigner] = useState();
  const [provider, setProvider] = useState();
  const [ownsToken, setOwner] = useState(false)

  async function checkConnection() {
    ethereum.request({ method: 'eth_accounts' })
            .then(handleChange)
            .catch(console.error);
  }

  async function handleChange(accounts) {
    if(accounts.length !== 0){
      establishProvider();
      setIsConnected(true);
    }
  }

  function establishProvider(){
    if (typeof window.ethereum !== "undefined") {
      let connectedProvider = new ethers.providers.Web3Provider(window.ethereum);
      setSigner(connectedProvider.getSigner());
      setProvider(connectedProvider);
    }
  }

  async function connectMetamask () {
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({ method: "eth_requestAccounts" });
        establishProvider();
        setIsConnected(true);
      }catch(e) {
        alert(e);
      }
    }else {
      setIsConnected(false);
    }
  }
  async function isNftMinted() {
    try{
      const contractAddress = "0x8Af1ABE890BD508A4d871E5485102561b3fd8bf4";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tokenGate = await contract.balanceOf(signer.getAddress());
      //check token
      if(tokenGate.toNumber() >= 1){
        setOwner(true);
      }else
      {
        setOwner(false);
      }
    }catch(e)
    {
      alert(e)
    }
  }

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.title}>Hello Clever Programmer!</div>
      {isConnected ? (
        <>
          <div className={styles.subtitle}>Metamask is Connected</div>
          <div className={styles.floatChild}>
            <Minters signer={signer} provider={provider} />
            <button onClick={isNftMinted}>Load Dex</button>
          </div>
          <div className={styles.floatChild}>
          {ownsToken ? ( <Dex signer={signer} provider={provider} />):
          (<div></div>)
          }
          </div>
        </>
      ) : (
        <div>
          {" "}
          <button className={styles.button} onClick={() => connectMetamask()}>Connect</button>{" "}
        </div>
      )}
    </div>
  );
} 
