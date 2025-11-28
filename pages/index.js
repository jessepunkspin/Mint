import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider
} from "@web3modal/ethers/react";
import { CONTRACT_ADDRESS } from "../web3modal";

const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function maxSupply() view returns (uint256)",
  "function price() view returns (uint256)",
  "function cost() view returns (uint256)",
  "function publicSalePrice() view returns (uint256)",
  "function claim(uint256) payable",
  "function mint(uint256) payable",
  "function mintTo(address,uint256) payable",
  "function safeMint(address,uint256) payable"
];

export default function Home() {
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [contract, setContract] = useState(null);
  const [info, setInfo] = useState({
    name: "NFT",
    symbol: "",
    supply: null,
    maxSupply: null,
    price: null
  });
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReadData();
  }, []);

  async function loadReadData() {
    try {
      const rpc = new ethers.JsonRpcProvider("https://mainnet.base.org");
      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, rpc);

      let name = await safe(c.name);
      let symbol = await safe(c.symbol);
      let supply = await safeNum(c.totalSupply);
      let maxSupply = await safeNum(c.maxSupply);

      let price = await safeNum(c.price);
      if (!price) price = await safeNum(c.cost);
      if (!price) price = await safeNum(c.publicSalePrice);
      if (price) price = ethers.formatEther(price);

      setInfo({
        name: name || "JessePunk Legends",
        symbol: symbol || "",
        supply: supply ?? "—",
        maxSupply: maxSupply ?? "—",
        price: price || null
      });
    } catch (e) {
      console.log("Read error", e);
    }
  }

  async function safe(fn) {
    try {
      return await fn();
    } catch {
      return null;
    }
  }

  async function safeNum(fn) {
    try {
      return (await fn()).toString();
    } catch {
      return null;
    }
  }

  async function setupContract() {
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }

  async function handleMint() {
    if (!isConnected) {
      setStatus("Connect your wallet first.");
      return;
    }

    setLoading(true);
    setStatus("Preparing transaction…");

    try {
      const c = await setupContract();
      setContract(c);

      const q = Number(qty || 1);

      let price = info.price ? ethers.parseEther(info.price) : 0n;
      let total = price * BigInt(q);

      const methods = [
        ["claim", [q]],
        ["mint", [q]],
        ["mintTo", [address, q]],
        ["safeMint", [address, q]]
      ];

      for (const [fn, args] of methods) {
        try {
          const tx = await c[fn](...args, { value: total });
          setStatus("Waiting for confirmation…");
          await tx.wait();
          setStatus("Mint successful ✅");
          loadReadData();
          setLoading(false);
          return;
        } catch (err) {}
      }

      setStatus("Mint method not found. Need full ABI.");
    } catch (e) {
      setStatus("Transaction failed.");
    }

    setLoading(false);
  }

  return (
    <div className="container">
      <div className="card">
        <div className="row">
          <div>
            <div className="title">{info.name}</div>
            <div className="small">{info.symbol}</div>
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

      <div className="card center">
        <img
          className="nft-img"
          src="/jessepunk.png"
          alt="NFT"
          style={{ width: 260, height: 260, borderRadius: 8 }}
        />
      </div>

      <div className="card">
        <div className="row">
          <div>
            <div className="small">Price</div>
            <div style={{ fontWeight: 700 }}>
              {info.price ? `${info.price} ETH` : "Unknown"}
            </div>
          </div>

          <div className="right">
            <div className="small">Supply</div>
            <div>
              {info.supply} / {info.maxSupply}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }} className="row">
          <div>
            <input
              className="inputQty"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <span style={{ marginLeft: 10 }} className="small">
              qty
            </span>
          </div>

          <div>
            <button className="btn" onClick={handleMint} disabled={loading}>
              {loading ? "Processing…" : "Mint Now"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn secondary" onClick={loadReadData}>
            Refresh Info
          </button>
        </div>
      </div>

      <div className="card small">
        <strong>Status:</strong> {status}
        <div className="footer">Contract: {CONTRACT_ADDRESS}</div>
      </div>
    </div>
  );
                }
