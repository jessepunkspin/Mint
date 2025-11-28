import { useEffect, useState } from "react";
import { ethers } from "ethers";

// BASE RPC
const RPC = "https://mainnet.base.org";

// Your contract address
const CONTRACT = "0x6a0DbB7e447B8f681afbe5ec8b1573e6FaFf7ba2";

// NFT Image (fixed)
const IMAGE =
  "https://ipfs.thirdwebcdn.com/ipfs/QmZWe632bsbtXN33xcFr11UEFppWsViX9G8Ppo4CnCnkep/0.png";

// Price of your NFT
const NFT_PRICE = "0.0003";

// Contract functions
const ABI = [
  "function totalSupply() view returns (uint256)",
  "function maxSupply() view returns (uint256)",

  "function mintTo(address to, uint256 quantity) payable",
  "function claim(uint256 quantity) payable",
  "function mint(uint256 quantity) payable"
];

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [supply, setSupply] = useState("-");
  const [maxSupply, setMaxSupply] = useState("-");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Ready");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    loadPublicInfo();
  }, []);

  async function loadPublicInfo() {
    try {
      const rpc = new ethers.JsonRpcProvider(RPC);
      const read = new ethers.Contract(CONTRACT, ABI, rpc);

      let ts = await read.totalSupply();
      let ms = await read.maxSupply();

      setSupply(ts.toString());
      setMaxSupply(ms.toString());
    } catch (err) {
      console.log("Failed to load supply", err);
    }
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("No wallet found");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      setAddress(accounts[0]);

      const prov = new ethers.BrowserProvider(window.ethereum);
      const signer = await prov.getSigner();
      const write = new ethers.Contract(CONTRACT, ABI, signer);

      setProvider(write);
      setStatus("Wallet connected");
    } catch (e) {
      setStatus("Failed to connect");
    }
  }

  async function mintNFT() {
    if (!provider) return setStatus("Connect wallet first");

    try {
      setStatus("Minting...");
      const mintCost = ethers.parseEther(NFT_PRICE);

      // Try different mint functions (Thirdweb drops use different ones)
      try {
        const tx = await provider.mintTo(address, qty, { value: mintCost });
        await tx.wait();
        return setStatus("Mint successful ✔");
      } catch (e1) {}

      try {
        const tx = await provider.claim(qty, { value: mintCost });
        await tx.wait();
        return setStatus("Mint successful ✔");
      } catch (e2) {}

      try {
        const tx = await provider.mint(qty, { value: mintCost });
        await tx.wait();
        return setStatus("Mint successful ✔");
      } catch (e3) {}

      setStatus("Mint failed. Contract uses a custom mint function.");
    } catch (err) {
      setStatus("Transaction rejected");
    }
  }

  return (
    <div style={{ padding: 20, background: "black", minHeight: "100vh", color: "white" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>NFT</h1>

      {/* Wallet Button */}
      <button
        style={{
          background: "#006CFF",
          padding: "12px 20px",
          borderRadius: 8,
          border: "none",
          color: "white",
          fontWeight: "bold",
          float: "right"
        }}
        onClick={connectWallet}
      >
        {address ? "Wallet Connected" : "Connect Wallet"}
      </button>

      <div style={{ clear: "both", marginTop: 30 }} />

      {/* NFT preview */}
      <div
        style={{
          width: "100%",
          height: 300,
          background: "#1a1a1a",
          borderRadius: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <img
          src={IMAGE}
          alt="NFT"
          style={{ width: "100%", borderRadius: 12 }}
        />
      </div>

      {/* Price + Supply */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 20 }}>Price</div>
        <div style={{ fontSize: 22, fontWeight: "bold" }}>{NFT_PRICE} ETH</div>

        <div style={{ marginTop: 15, fontSize: 20 }}>Supply</div>
        <div style={{ fontSize: 22, fontWeight: "bold" }}>
          {supply} / {maxSupply}
        </div>
      </div>

      {/* Quantity */}
      <div style={{ marginTop: 20 }}>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{
            width: 80,
            padding: 8,
            fontSize: 18,
            borderRadius: 6,
            border: "none",
            textAlign: "center",
            color: "black"
          }}
        />
      </div>

      {/* Mint Button */}
      <button
        onClick={mintNFT}
        style={{
          marginTop: 20,
          background: "#006CFF",
          width: "100%",
          padding: 14,
          fontSize: 20,
          borderRadius: 8,
          border: "none",
          color: "white",
          fontWeight: "bold"
        }}
      >
        Mint Now
      </button>

      {/* Status */}
      <div style={{ marginTop: 20, opacity: 0.8 }}>
        <b>Status:</b> {status}
      </div>

      <div style={{ marginTop: 10, opacity: 0.5 }}>
        Contract:<br />
        {CONTRACT}
      </div>
    </div>
  );
  }
