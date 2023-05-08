import { useEffect, useState } from "react";
import { create } from "ipfs-http-client"; 
import { ethers } from "ethers";
import { Buffer } from 'buffer';
import { abi } from './utils/abi.js';


const Minters = ({signer, provider}) => {
  
  const ipfs = create({url: "https://ipfs.infura.io:5001/api/v0"})

  const [ipfsHash, setIpfsHash] = useState();
  const [localFileUrl, setLocalFileUrl] = useState();
  const [nftName, setNftName] = useState();
  const [nftDesc, setNftDesc] = useState();
  const [encode64, setEncode64] = useState();

  const setName = event => {
    setNftName(event.target.value);
  }

  const setDesc = event => {
    setNftDesc(event.target.value);
  }

  const handleFileUpload = event =>{
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      setLocalFileUrl(reader.result);
    }
  }

  const uploadToIpfs = async() => {
    const {path} =  await ipfs.add(localFileUrl);
    setIpfsHash(path)
    alert("Uploaded file to IPFS")
  }

  async function mint() {
    if(ipfsHash && nftName && nftDesc)
    {
      if (typeof window.ethereum !== "undefined") {
        const contractAddress = "0x8Af1ABE890BD508A4d871E5485102561b3fd8bf4";
        const contract = new ethers.Contract(contractAddress, abi, signer);
        
        try {
          const {hash} = await contract.mintNFT(encode64);
          await provider.waitForTransaction(hash);
          alert("NFT was minted")
        } catch (error) {
        }
      }
      else {
        alert("Please install MetaMask");
      }
    }
    else
    {
      alert("Cannot Mint an NFT without Name, Description and Content file");
    }
  }

  useEffect(() => {
    setEncode64("data:application/json;base64,"+
      Buffer.from(JSON.stringify({
      "name": nftName,
      "description": nftDesc,
      "image": 'https://ipfs.io/ipfs/'+ipfsHash
      })).toString('base64')
    )
  }, [ipfsHash,nftName,nftDesc]);

    return (
      <div className="Minter">
        <br></br>
        <h1 id="title">NFT Minter</h1>
        <h2>Upload content</h2>
        <form action=".">
          <input type="file" onChange={handleFileUpload} />
          <input type="button" value="Upload" onClick={uploadToIpfs} />
        </form>
        <form>
          <h2>Name: </h2>
          <input
            type="text"
            placeholder="Put the name of NFT here: "
            onChange={setName}
          />
          <h2>✍️ Description: </h2>
          <input
            type="text"
            placeholder="Put the description of NFT here: "
            onChange={setDesc}
          />
        </form>
        <button id="mintButton" onClick={mint}>
          Mint NFT
        </button>
      </div>
    );
  };
  
export default Minters;