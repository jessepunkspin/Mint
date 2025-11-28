import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider
} from "@web3modal/ethers/react";
import { CONTRACT_ADDRESS } from "../web3modal";

const ABI = [
  "function uri(uint256) view returns (string)",
  "function claimConditions(uint256) view returns (tuple(uint256 startTimestamp,uint256 maxClaimableSupply,uint256 supplyClaimed,uint256 quantityLimitPerWallet,uint256 pricePerToken,address currency,uint256 merkleRoot))",
  "function claimTo(address,uint256,uint256) payable"
];

const TOKEN_ID = 0;

export default function Home() {
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [price, setPrice] = useState(null);
  const [supply, setSupply] = useState(null);
  const [maxSupply, setMaxSupply] = useState(null);
  const [image, setImage] = useState("/jessepunk.png");

  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const rpc = new ethers.JsonRpcProvider("https://mainnet.base.org");
      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, rpc);

      // Load claim condition
      const cond = await c.claimConditions(TOKEN_ID);

      setPrice(ethers.formatEther(cond.pricePerToken));
      setSupply(cond.supplyClaimed.toString());
      setMaxSupply(cond.maxClaimableSupply.toString());

      // Load metadata
      const rawUri = await c.uri(TOKEN_ID);
      const cleanUri = rawUri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const meta = await fetch(cleanUri).then(r => r.json());
      setImage(meta.image.replace("ipfs://", "https://ipfs.io/ipfs/"));

    } catch (err) {
      console.log("Error loading data", err);
    }
  }

  async function handleMint() {
    if (!isConnected) {
      setStatus("Connect your wallet first.");
      return;
    }

    setLoading(true);
    setStatus("Minting…");

    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const totalCost = ethers.parseEther(String(price)) * BigInt(qty);

      const tx = await c.claimTo(
        address,
        TOKEN_ID,
        qty,
        { value: totalCost }
      );

      setStatus("Waiting for confirmation…");
      await tx.wait();

      setStatus("Mint successful! 🎉");
      loadData();
    } catch (e) {
      console.log(e);
      setStatus("Mint failed ❌");
    }

    setLoading(false);
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="card">
        <div className="row">
          <div>
            <div className="title">JessePunk Legends</div>
            <div className="small">Edition Drop</div>
          </div>

          <div className="right">
            {isConnected ? (
              <div className="small">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            ) : (
              <w3m-button />
            )}
          </div>
        </div>
      </div>

      {/* NFT image */}
      <div className="card center">
        <img
          src={image}
          style={{ width: 260, height: 260, borderRadius: 8 }}
        />
      </div>

      {/* Price + Supply */}
      <div className="card">
        <div className="row">
          <div>
            <div className="small">Price</div>
            <div style={{ fontWeight: 700 }}>
              {price ? `${price} ETH` : "Loading…"}
            </div>
          </div>

          <div className="right">
            <div className="small">Supply</div>
            <div>
              {supply} / {maxSupply}
            </div>
          </div>
        </div>

        {/* Quantity + Mint */}
        <div style={{ marginTop: 12 }} className="row">
          <div>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="inputQty"
            />
            <span className="small" style={{ marginLeft: 10 }}>qty</span>
          </div>

          <div>
            <button className="btn" disabled={loading} onClick={handleMint}>
              {loading ? "Minting…" : "Mint Now"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn secondary" onClick={loadData}>
            Refresh Info
          </button>
        </div>
      </div>

      <div className="card small">
        <strong>Status:</strong> {status}
        <div className="footer">{CONTRACT_ADDRESS}</div>
      </div>
    </div>
  );
  }
