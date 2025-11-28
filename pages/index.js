import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const CONTRACT_ADDRESS = "0x6a0DbB7e447B8f681afbe5ec8b1573e6FaFf7ba2";
const TOKEN_ID = 0;

const ABI = [
  "function uri(uint256) view returns (string)",
  "function balanceOf(address,uint256) view returns (uint256)",

  // Edition Drop claim condition
  "function claimConditions(uint256) view returns (tuple(uint256 startTimestamp,uint256 maxClaimableSupply,uint256 supplyClaimed,uint256 quantityLimitPerWallet,uint256 pricePerToken,address currency,uint256 merkleRoot))",

  // Mint function
  "function claimTo(address,uint256,uint256) payable"
];

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);

  const [price, setPrice] = useState(null);
  const [supplyClaimed, setSupplyClaimed] = useState(null);
  const [maxSupply, setMaxSupply] = useState(null);
  const [image, setImage] = useState("/jessepunk.png");

  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInfo();
  }, []);

  async function fetchInfo() {
    try {
      const rpc = new ethers.JsonRpcProvider("https://mainnet.base.org");
      const readContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, rpc);

      // Fetch claim condition
      const cond = await readContract.claimConditions(TOKEN_ID);

      setPrice(ethers.formatEther(cond.pricePerToken));
      setSupplyClaimed(cond.supplyClaimed.toString());
      setMaxSupply(cond.maxClaimableSupply.toString());

      // Fetch metadata (image)
      const uri = await readContract.uri(TOKEN_ID);
      let url = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const meta = await fetch(url).then(r => r.json());
      let img = meta.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      setImage(img);

    } catch (err) {
      console.log("Error loading info:", err);
    }
  }

  async function connectWallet() {
    try {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: { infuraId: "" }
        }
      };
      const web3Modal = new Web3Modal({ cacheProvider: true, providerOptions });
      const instance = await web3Modal.connect();

      const p = new ethers.BrowserProvider(instance);
      const s = await p.getSigner();
      const addr = await s.getAddress();

      setProvider(p);
      setSigner(s);
      setAddress(addr);

      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, s);
      setContract(c);

      setStatus("Wallet connected");
    } catch (err) {
      setStatus("Connection failed");
    }
  }

  async function mint() {
    if (!contract) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Sending transaction...");

      const total = ethers.parseEther((price * qty).toString());

      const tx = await contract.claimTo(
        address,
        TOKEN_ID,
        qty,
        { value: total }
      );

      setStatus("Waiting for confirmation...");
      await tx.wait();

      setStatus("Mint successful!");
      fetchInfo();
    } catch (err) {
      console.log(err);
      setStatus("Mint failed");
    }

    setLoading(false);
  }

  return (
    <div className="container">

      <div className="card">
        <div className="row">
          <div>
            <div className="title">JessePunk Legends</div>
            <div className="small">Edition Drop</div>
          </div>

          <div className="right">
            {address ? (
              <div className="small">{address.slice(0,6)}...{address.slice(-4)}</div>
            ) : (
              <button className="btn" onClick={connectWallet}>Connect Wallet</button>
            )}
          </div>
        </div>
      </div>

      <div className="card center">
        <img className="nft-img"
          src={image}
          style={{ width:260, height:260, borderRadius:8 }}
        />
      </div>

      <div className="card">
        <div className="row">
          <div>
            <div className="small">Price</div>
            <div style={{fontWeight:700}}>
              {price ? `${price} ETH` : "Unknown"}
            </div>
          </div>

          <div className="right">
            <div className="small">Supply</div>
            <div>{supplyClaimed ?? "-"} / {maxSupply ?? "-"}</div>
          </div>
        </div>

        <div style={{marginTop:12}} className="row">
          <div>
            <input className="inputQty"
              type="number"
              min="1"
              value={qty}
              onChange={(e)=>setQty(e.target.value)}
            />
            <span style={{marginLeft:10}} className="small">qty</span>
          </div>

          <div>
            <button className="btn" onClick={mint} disabled={loading}>
              {loading ? "Processing..." : "Mint Now"}
            </button>
          </div>
        </div>

        <div style={{marginTop:12}}>
          <button className="btn secondary" onClick={fetchInfo}>Refresh Info</button>
        </div>
      </div>

      <div className="card small">
        <strong>Status:</strong> {status}
        <div className="footer">Contract: {CONTRACT_ADDRESS}</div>
      </div>

    </div>
  );
    }
