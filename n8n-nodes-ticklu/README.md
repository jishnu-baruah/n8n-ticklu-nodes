# Ticklu n8n Nodes

A comprehensive collection of n8n community nodes for blockchain operations, featuring NEAR blockchain transactions and Filecoin storage with Synapse SDK.

## 🚀 Features

### **NEAR Blockchain Node**
- ✅ **Execute Payout Intent**: Send NEAR tokens with multiple execution modes
- ✅ **Multi-RPC Support**: Automatic failover between RPC providers
- ✅ **Enhanced Error Handling**: Clear error messages and recovery
- ✅ **Rate Limit Protection**: Uses optimized RPC providers

### **Filecoin Storage Nodes**
- ✅ **Store Proof**: Store JSON data on Filecoin using Synapse SDK
- ✅ **Retrieve Proof**: Retrieve stored data using PieceCID
- ✅ **ES Module Compatibility**: Works with Synapse SDK in CommonJS environment
- ✅ **Multiple Access Methods**: SDK + IPFS gateway access

## 📦 Installation

```bash
npm install n8n-nodes-ticklu
```

## 🔧 Configuration

### **NEAR Credentials**
Configure your NEAR credentials with:
- **Account ID**: Your NEAR account
- **Private Key**: Wallet private key
- **API Base URL**: 1-Click API endpoint (optional)
- **JWT**: Bearer token for API (optional)

### **Filecoin Credentials**
Configure Filecoin credentials with:
- **Private Key**: Filecoin wallet private key
- **RPC URL**: WebSocket RPC URL (defaults to Calibration testnet)

## 🎯 Usage Examples

### **NEAR Transaction**
```json
{
  "executionMode": "headless",
  "recipientAddress": "recipient.near",
  "amount": 1.5
}
```

### **Filecoin Storage**
```json
{
  "jsonData": {
    "mode": "headless",
    "status": "success",
    "transactionHash": "E34PrFosqK46xqVs3mRtBjiNiQtC6FXeVtnXj2YKouw8",
    "explorerUrl": "https://nearblocks.io/txns/E34PrFosqK46xqVs3mRtBjiNiQtC6FXeVtnXj2YKouw8",
    "timestamp": 1758797845588
  },
  "fileName": "transaction-proof.json"
}
```

### **Filecoin Retrieval**
```json
{
  "pieceCid": "bafkzcibcfqbscvdmt6gxckpxoh7rzvzka7hdquw2ndyrh4az2tlq5yh6j7wokcy"
}
```

## 🔍 Troubleshooting

### **NEAR RPC Issues**
- ✅ **Automatic Failover**: Multiple RPC providers with automatic switching
- ✅ **Rate Limit Handling**: Uses optimized providers (FastNear, Lava Network)
- ✅ **Connection Testing**: Tests each provider before use

### **Filecoin Storage Issues**
- ✅ **ES Module Compatibility**: Handles Synapse SDK in CommonJS environment
- ✅ **Multiple Access Methods**: SDK + IPFS gateway fallback
- ✅ **Enhanced Debugging**: Detailed logging and error messages

### **Common Issues**
1. **Invalid JSON Format**: Ensure proper JSON syntax with quotes and commas
2. **RPC Rate Limits**: Automatic failover handles this
3. **Synapse SDK Loading**: Enhanced wrapper handles ES module compatibility

## 📋 Node Details

### **Execute NEAR Payout**
- **Display Name**: NEAR: Execute Payout Intent
- **Category**: Transform
- **Modes**: Headless, Approval, Human Signing
- **Features**: Multi-RPC, error handling, transaction tracking

### **Filecoin Store Proof**
- **Display Name**: Filecoin: Store Proof
- **Category**: Transform
- **Features**: Synapse SDK, automatic payments, balance checking
- **Output**: PieceCID, file info, balance details

### **Filecoin Retrieve Proof**
- **Display Name**: Filecoin: Retrieve Proof
- **Category**: Transform
- **Features**: Data retrieval, multiple access methods, debugging
- **Output**: Retrieved data, access URLs, metadata

## 🛠️ Development

### **Build**
```bash
npm run build
```

### **Development**
```bash
npm run dev
```

### **Linting**
```bash
npm run lint
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ticklu/n8n-nodes-ticklu/issues)
- **Documentation**: [Ticklu Docs](https://docs.ticklu.com)
- **Community**: [n8n Community](https://community.n8n.io)

## 🎉 Acknowledgments

- **n8n Team**: For the amazing workflow automation platform
- **NEAR Protocol**: For blockchain infrastructure
- **Filecoin**: For decentralized storage
- **Synapse SDK**: For Filecoin integration

---

**Built with ❤️ by the Ticklu team**