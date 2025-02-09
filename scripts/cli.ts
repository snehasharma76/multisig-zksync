import { Provider, Wallet, utils } from "zksync-web3";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import * as readline from 'readline';

dotenv.config();

const MULTISIG_ABI = [
  "function submitTransaction(address to, uint256 value, bytes data) public",
  "function confirmTransaction(uint256 txIndex) public",
  "function executeTransaction(uint256 txIndex) public",
  "function getTransaction(uint256 _txIndex) public view returns (address to, uint256 value, bytes memory data, bool executed, uint256 numConfirmations)",
  "function getTransactionCount() public view returns (uint256)",
  "function owners(uint256) public view returns (address)",
  "function getOwners() public view returns (address[])"
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve));

async function waitForTransaction(provider: Provider, hash: string, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const receipt = await provider.getTransactionReceipt(hash);
    if (receipt) {
      if (receipt.status) {
        return receipt;
      } else {
        throw new Error(`Transaction failed: ${hash}`);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Transaction pending for too long: ${hash}`);
}

async function main() {
  const provider = new Provider("https://sepolia.era.zksync.dev");
  const wallet = new Wallet(process.env.WALLET_PRIVATE_KEY || "", provider);
  const MULTISIG_ADDRESS = "0x3f3EdA70B1732644F5C8EA8c88D7De978ecF791f";
  const multiSig = new ethers.Contract(MULTISIG_ADDRESS, MULTISIG_ABI, wallet);

  // Check if wallet is an owner
  const owners = await multiSig.getOwners();
  const isOwner = owners.some((owner: string) => owner.toLowerCase() === wallet.address.toLowerCase());
  if (!isOwner) {
    console.error(`Error: Your wallet (${wallet.address}) is not an owner of this MultiSig wallet`);
    console.log("Owners are:", owners);
    process.exit(1);
  }

  console.log("\nZKSync Era MultiSig Wallet CLI");
  console.log("===============================");
  console.log("Connected wallet:", wallet.address);
  console.log("MultiSig address:", MULTISIG_ADDRESS);
  console.log("Network: ZKSync Era Sepolia");
  console.log("\nOptions:");
  console.log("1. Submit Transaction");
  console.log("2. Confirm Transaction");
  console.log("3. Execute Transaction");
  console.log("4. View Transaction Details");
  console.log("5. Get Transaction Count");
  console.log("6. Exit");

  while (true) {
    const choice = await question("\nEnter your choice (1-6): ");

    try {
      switch (choice) {
        case "1": {
          const to = await question("Enter recipient address: ");
          if (!ethers.utils.isAddress(to)) {
            throw new Error("Invalid recipient address");
          }

          const value = await question("Enter amount in ETH: ");
          const valueInWei = ethers.utils.parseEther(value.toString());
          const data = "0x";

          console.log("\nPreparing transaction...");
          console.log("To:", to);
          console.log("Value:", value, "ETH");

          const gasPrice = await provider.getGasPrice();
          console.log("Current gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");

          console.log("\nSubmitting transaction...");
          const tx = await multiSig.submitTransaction(to, valueInWei, data, {
            gasLimit: 500000, // Increased gas limit
            gasPrice: gasPrice
          });
          
          console.log(`Transaction sent! Hash: ${tx.hash}`);
          console.log("Waiting for confirmation...");
          
          const receipt = await waitForTransaction(provider, tx.hash);
          console.log(`Transaction confirmed in block ${receipt.blockNumber}!`);
          console.log(`View on Explorer: https://explorer.sepolia.era.zksync.dev/tx/${tx.hash}`);
          break;
        }

        case "2": {
          const txIndex = await question("Enter transaction index to confirm: ");
          console.log("\nConfirming transaction...");
          const tx = await multiSig.confirmTransaction(parseInt(txIndex.toString()), {
            gasLimit: 500000
          });
          
          console.log(`Transaction sent! Hash: ${tx.hash}`);
          console.log("Waiting for confirmation...");
          
          const receipt = await waitForTransaction(provider, tx.hash);
          console.log(`Transaction confirmed in block ${receipt.blockNumber}!`);
          console.log(`View on Explorer: https://explorer.sepolia.era.zksync.dev/tx/${tx.hash}`);
          break;
        }

        case "3": {
          const txIndex = await question("Enter transaction index to execute: ");
          console.log("\nExecuting transaction...");
          const tx = await multiSig.executeTransaction(parseInt(txIndex.toString()), {
            gasLimit: 500000
          });
          
          console.log(`Transaction sent! Hash: ${tx.hash}`);
          console.log("Waiting for confirmation...");
          
          const receipt = await waitForTransaction(provider, tx.hash);
          console.log(`Transaction confirmed in block ${receipt.blockNumber}!`);
          console.log(`View on Explorer: https://explorer.sepolia.era.zksync.dev/tx/${tx.hash}`);
          break;
        }

        case "4": {
          const txIndex = await question("Enter transaction index to view: ");
          const [to, value, data, executed, numConfirmations] = await multiSig.getTransaction(parseInt(txIndex.toString()));
          console.log("\nTransaction Details:");
          console.log("-------------------");
          console.log("To:", to);
          console.log("Value:", ethers.utils.formatEther(value), "ETH");
          console.log("Data:", data);
          console.log("Executed:", executed);
          console.log("Number of confirmations:", numConfirmations.toString());
          break;
        }

        case "5": {
          const count = await multiSig.getTransactionCount();
          console.log(`\nTotal number of transactions: ${count.toString()}`);
          break;
        }

        case "6": {
          console.log("\nGoodbye!");
          rl.close();
          return;
        }

        default:
          console.log("Invalid choice. Please try again.");
      }
    } catch (error: any) {
      console.error("\nError:", error.message || error);
      if (error.transaction) {
        console.log("Transaction hash:", error.transaction.hash);
        console.log("View on Explorer: https://explorer.sepolia.era.zksync.dev/tx/" + error.transaction.hash);
      }
    }
  }
}

main().catch(console.error);
