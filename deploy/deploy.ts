import { Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as dotenv from "dotenv";

dotenv.config();

async function deploy(hre: HardhatRuntimeEnvironment) {
  // Initialize the wallet.
  const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
  if (!PRIVATE_KEY)
    throw "⛔️ Private key not detected! Add it to the .env file!";

  // Initialize deployer
  const wallet = new Wallet(PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  // Load artifact
  const artifact = await deployer.loadArtifact("MultiSigWallet");

  // Define constructor arguments
  const owners = [
    wallet.address, // Add your wallet address as the first owner
    // Add more owner addresses here
  ];
  const requiredConfirmations = 1; // Set this according to your needs

  // Deploy the contract
  console.log(`\nDeploying MultiSigWallet...`);
  const multiSigWallet = await deployer.deploy(artifact, [owners, requiredConfirmations]);

  // Show the contract info
  console.log(`\nMultiSigWallet was deployed to ${multiSigWallet.address}`);
  console.log(`Constructor arguments:`);
  console.log(`- Owners:`, owners);
  console.log(`- Required confirmations: ${requiredConfirmations}`);
}

module.exports = deploy;
