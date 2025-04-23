import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from '../abi/ContentRegistry.json';

const contractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

export default function UserGallery({ account }) {
  const [userContents, setUserContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadedCids, setUploadedCids] = useState(new Set());

  useEffect(() => {
    if (account) {
      loadUserContents();
    } else {
      setLoading(false);
    }
  }, [account]);

  const loadUserContents = async () => {
    try {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Create contract with minimal interface
      const contract = new ethers.Contract(
        contractAddress,
        [
          "function getUserContents(address) view returns (string[])",
          "function getContent(string) view returns (string,string,string,address,uint256,bool)"
        ],
        provider
      );

      // Try to get user contents with a more basic approach
      const cids = await contract.getUserContents(account).catch(() => []);
      
      if (!cids || cids.length === 0) {
        setUserContents([]);
        setLoading(false);
        return;
      }

      const contents = await Promise.all(
        cids.map(async (cid) => {
          try {
            const [title, description, contentType, owner, timestamp, exists] = 
              await contract.getContent(cid).catch(() => [null, null, null, null, null, false]);
            
            if (exists) {
              return {
                cid,
                title,
                description,
                contentType,
                timestamp: new Date(Number(timestamp) * 1000).toLocaleString()
              };
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      const validContents = contents.filter(content => content !== null);
      setUserContents(validContents);
      setLoading(false);

    } catch {
      setUserContents([]);
      setLoading(false);
    }
  };

  const loadUserContent = async () => {
    if (!account || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
      const userCids = await contract.getUserContents(account);
      setUploadedCids(new Set(userCids));
    } catch (err) {
      console.error('Error loading user content:', err);
    }
  };

  if (loading) {
    return <div className="text-center text-white">Loading your content...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {userContents.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-black">Your Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userContents.map((content) => (
              <div key={content.cid} className="border rounded-lg p-4">
                <h3 className="font-bold text-black">{content.title}</h3>
                <p className="text-sm text-black">{content.description}</p>
                <p className="text-xs text-black mt-2">Type: {content.contentType}</p>
                <p className="text-xs text-black">Registered: {content.timestamp}</p>
                <p className="text-xs font-mono mt-2 break-all text-black">CID: {content.cid}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 