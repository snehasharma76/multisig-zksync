# ZKSync Multi-Signature Wallet

This project implements a secure multi-signature wallet for ZKSync Era. The wallet requires a specified number of confirmations from authorized owners before executing transactions.

## Features

- Multiple owner management
- Transaction submission and confirmation
- Required number of confirmations for execution
- Transaction execution with value transfer
- Event emission for all important actions
- Reentrancy protection

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and fill in your private key:
```bash
cp .env.example .env
```

## Deployment

1. Make sure your wallet has enough ETH on ZKSync Era network
2. Update the owner addresses and required confirmations in `deploy/deploy.ts`
3. Deploy to ZKSync Era testnet:
```bash
npx hardhat deploy-zksync --network zkSyncTestnet
```

## Deployment Result

The contract was successfully deployed to ZKSync Era Sepolia testnet:

- **Contract Address**: `0x3f3EdA70B1732644F5C8EA8c88D7De978ecF791f`
- **Initial Owner**: `0xb18109b3b6B8Ba5188cbDdBd2bb6046fa69F605C`

You can view the contract on the ZKSync Era Sepolia Explorer: [Explorer Link](https://explorer.sepolia.era.zksync.dev/address/0x3f3EdA70B1732644F5C8EA8c88D7De978ecF791f)

## Contract Usage

The contract includes the following main functions:

- `submitTransaction`: Submit a new transaction for approval
- `confirmTransaction`: Confirm a pending transaction
- `executeTransaction`: Execute a transaction that has enough confirmations
- `revokeConfirmation`: Revoke a previous confirmation

## Security

The contract includes several security features:
- Reentrancy protection
- Owner validation
- Multiple confirmation requirements
- Transaction existence checks
- Execution status validation

## License

MIT
