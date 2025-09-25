# Filecoin Integration with Synapse SDK

This n8n node has been updated to use the Synapse SDK for direct Filecoin storage operations, replacing the previous web3.storage integration.

## Features

- **Direct Filecoin Storage**: Uses Synapse SDK to store data directly on Filecoin network
- **Automatic Payment Setup**: Handles USDFC token deposits and service approvals automatically
- **Balance Checking**: Verifies sufficient tFIL and USDFC balances before operations
- **Calibration Testnet**: Configured for Filecoin Calibration testnet by default

## Prerequisites

### 1. Wallet Setup
- A Filecoin wallet with private key
- Sufficient tFIL tokens for gas fees (minimum 1 tFIL recommended)
- USDFC tokens for storage payments (minimum 5 USDFC recommended)

### 2. Testnet Tokens
Get testnet tokens from:
- **tFIL**: [Calibration Faucet](https://faucet.calibration.fildev.network/)
- **USDFC**: Available through Synapse SDK payment system

## Configuration

### Credentials Setup

1. **Private Key**: Your Filecoin wallet private key (required)
2. **WebSocket RPC URL**: Filecoin network RPC endpoint
   - Default: `https://api.calibration.node.glif.io/rpc/v1` (Calibration testnet)
   - Mainnet: `https://api.node.glif.io/rpc/v1`

### Node Parameters

- **JSON Data to Store**: The data object to store on Filecoin
- **File Name**: Optional filename for the stored data

## How It Works

1. **Initialization**: Creates Synapse SDK instance with your credentials
2. **Balance Check**: Verifies tFIL balance for gas fees
3. **Payment Setup**: 
   - Checks USDFC balance in payments contract
   - Deposits additional USDFC if needed
   - Approves Warm Storage service for payments
4. **Data Upload**: Converts JSON to bytes and uploads to Filecoin
5. **Cleanup**: Properly closes provider connections

## Output

The node returns:
- `pieceCid`: The Filecoin Piece CID of stored data
- `fileName`: The filename used for storage
- `dataSize`: Size of stored data in bytes
- `walletBalance`: Your tFIL wallet balance
- `usdfcBalance`: Your USDFC balance in payments contract

## Error Handling

The node provides detailed error messages for:
- Missing credentials
- Insufficient token balances
- Network connection issues
- Upload failures

## Example Usage

```json
{
  "jsonData": {
    "metadata": "DAO vote snapshot #42",
    "timestamp": 1703123456789,
    "hash": "0xdeadbeefcafebabefeedface123456789abcdef",
    "remarks": "Decentralized storage test",
    "randyRatings": 5
  },
  "fileName": "dao-vote-42.json"
}
```

## Migration from web3.storage

If you were previously using the web3.storage integration:

1. **Remove old credentials**: Delete web3.storage API token credentials
2. **Add new credentials**: Set up Filecoin credentials with private key and RPC URL
3. **Update workflows**: Change credential references from `web3StorageApi` to `filecoinCredentials`
4. **Test thoroughly**: Verify token balances and test with small data first

## Troubleshooting

### Common Issues

1. **"Insufficient tFIL balance"**
   - Get tFIL tokens from Calibration faucet
   - Ensure wallet has at least 1 tFIL

2. **"Insufficient USDFC balance"**
   - The node will attempt to deposit USDFC automatically
   - Ensure you have USDFC tokens in your wallet

3. **"Service approval failed"**
   - Check network connection
   - Verify RPC URL is correct
   - Ensure sufficient gas fees

### Debug Information

The node logs detailed information including:
- Wallet balances
- Transaction hashes
- Upload progress
- Error details

## Security Notes

- Private keys are stored securely in n8n credentials
- All operations use testnet tokens (no real value at risk)
- Provider connections are properly closed after use

## Support

For issues with:
- **Synapse SDK**: Check [Synapse documentation](https://docs.synapse.filoz.com/)
- **Filecoin**: Check [Filecoin documentation](https://docs.filecoin.io/)
- **n8n**: Check [n8n documentation](https://docs.n8n.io/)
