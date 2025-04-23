// verifyCID.js (Safe check with callStatic and fallback)

const { ethers } = require("ethers");
const fs = require("fs");

// Replace with your real Sepolia RPC URL
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/8b776ab339ae4a53ab71f5d7bfd8e2be");

const abiJson = JSON.parse(fs.readFileSync("./frontend/src/abi/ContentRegistry.json", "utf8"));
const abi = abiJson.abi;

const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const cidToCheck = "QmSaJwbFQok4kKX9SewnWrnLXxRQk1QDJKuLNa81nNdVqi";

async function main() {
  try {
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Try static call and trap empty return
    let result;
    try {
      result = await contract.getContent(cidToCheck);
    } catch (innerErr) {
      if (innerErr.code === 'BAD_DATA' && innerErr.value === '0x') {
        console.log("✅ This CID has not been uploaded before. No duplicates found.");
        return;
      }
      throw innerErr;
    }

    if (!result || !result.cid || result.cid === "" || result.owner === "0x0000000000000000000000000000000000000000") {
      console.log("✅ This CID has not been uploaded before. No duplicates found.");
    } else {
      console.log("❌ Duplicate CID detected! This content was already uploaded.");
      console.log("📦 Title:", result.title);
      console.log("📃 Description:", result.description);
      console.log("👤 Owner:", result.owner);
      console.log("⏱ Timestamp:", new Date(result.timestamp * 1000).toLocaleString());
    }
  } catch (err) {
    console.error("Error verifying CID:", err);
  }
}

main();
