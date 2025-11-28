import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT = "0x6a0DbB7e447B8f681afbe5ec8b1573e6FaFf7ba2";
const IMAGE =
  "https://ipfs.thirdwebcdn.com/ipfs/QmZWe632bsbtXN33xcFr11UEFppWsViX9G8Ppo4CnCnkep/0.png";

export default function Home() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("No wallet found.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAddress(accounts[0]);
      setStatus("Wallet connected.");
    } catch {
      setStatus("Connection failed.");
    }
  }

  async function mintNFT() {
    if (!window.ethereum) {
      setStatus("No wallet found.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Minting...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const abi = [
        "function mintTo(address to, uint256 quantity) payable",
        "function claim(uint256 quantity) payable",
        "function mint(uint256 quantity) payable",
      ];

      const contract = new ethers.Contract(CONTRACT, abi, signer);

      const price = ethers.parseEther("0.0003");
      const qty = 1;

      try {
        const tx = await contract.mintTo(address, qty, { value: price });
        await tx.wait();
        setStatus("Minted successfully ✔");
      } catch (e1) {
        try {
          const tx = await contract.claim(qty, { value: price });
          await tx.wait();
          setStatus("Minted successfully ✔");
        } catch (e2) {
          try {
            const tx = await contract.mint(qty, { value: price });
            await tx.wait();
            setStatus("Minted successfully ✔");
          } catch (e3) {
            setStatus("Mint failed. Contract uses a custom function.");
          }
        }
      }
    } catch {
      setStatus("Error or user rejected.");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
        color: "white",
        background: "black",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textAlign: "center" }}>JessePunk Angel NFT</h1>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <img
          src={IMAGE}
          alt="nft"
          style={{
            width: 260,
            borderRadius: 12,
          }}
        />
      </div>

      {!address ? (
        <button
          onClick={connectWallet}
          style={{
            width: "100%",
            padding: 12,
            background: "#006CFF",
            borderRadius: 8,
            border: "none",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <button
          onClick={mintNFT}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: loading ? "#333" : "#00C853",
            borderRadius: 8,
            border: "none",
            color: "white",
            fontWeight: "bold",
            marginTop: 10,
          }}
        >
          {loading ? "Minting..." : "Mint for 0.0003 ETH"}
        </button>
      )}

      <p style={{ marginTop: 20, textAlign: "center" }}>{status}</p>

      {address && (
        <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      )}
    </div>
  );
}
