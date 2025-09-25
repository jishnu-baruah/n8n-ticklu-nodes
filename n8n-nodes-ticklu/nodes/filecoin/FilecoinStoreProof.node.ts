import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError } from 'n8n-workflow';
import { ethers } from 'ethers';
import { SynapseWrapper } from './SynapseWrapper';

export class FilecoinStoreProof implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Filecoin: Store Proof',
		name: 'tickluFilecoinStoreProof',
		icon: 'file:filecoin.svg',
		group: ['transform'],
		version: 1,
		description: 'Stores a JSON object on Filecoin via Synapse SDK with dynamic import.',
		defaults: { name: 'Store Proof on Filecoin' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'filecoinCredentialsApi', required: true }],
		properties: [
			{ displayName: 'JSON Data to Store', name: 'jsonData', type: 'json', default: '', required: true },
			{ displayName: 'File Name', name: 'fileName', type: 'string', default: 'proof-{{ Date.now() }}.json', required: true },
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
			const jsonData = this.getNodeParameter('jsonData', itemIndex) as unknown;
			const fileName = this.getNodeParameter('fileName', itemIndex) as string;

			const creds = await this.getCredentials('filecoinCredentials');
			if (!creds) {
				throw new NodeOperationError(this.getNode(), 'Missing Filecoin credentials');
			}
			const privateKey = (creds as any).privateKey as string;
			const wsRpcUrl = (creds as any).wsRpcUrl as string;

			if (!privateKey) {
				throw new NodeOperationError(this.getNode(), 'Private key is required for Filecoin operations');
			}

			try {
				console.log('🚀 Starting Filecoin storage process...');
				console.log('📋 Using RPC URL:', wsRpcUrl || 'https://api.calibration.node.glif.io/rpc/v1');
				
				// Initialize Synapse SDK wrapper
				const synapse = new SynapseWrapper();
				await synapse.initialize(privateKey, wsRpcUrl || 'https://api.calibration.node.glif.io/rpc/v1');

				// Check wallet balance
				const walletBalance = await synapse.getWalletBalance();
				console.log('Wallet tFIL balance:', ethers.formatEther(walletBalance), 'tFIL');

				// Check if we have enough tFIL for storage operations
				const minRequiredtFIL = ethers.parseUnits('1', 18); // 1 tFIL minimum
				if (walletBalance < minRequiredtFIL) {
					throw new NodeOperationError(this.getNode(), `Insufficient tFIL balance. Need at least ${ethers.formatEther(minRequiredtFIL)} tFIL for storage operations.`);
				}

				// Check USDFC balance in payments contract
				const usdfcBalance = await synapse.getUSDFCBalance();
				console.log('Current USDFC balance in payments contract:', ethers.formatEther(usdfcBalance), 'USDFC');

				// Check if we need more USDFC
				const requiredUSDFC = ethers.parseUnits('5', 18); // 5 USDFC
				if (usdfcBalance < requiredUSDFC) {
					const neededAmount = requiredUSDFC - usdfcBalance;
					console.log(`Need ${ethers.formatEther(neededAmount)} more USDFC. Depositing...`);
					
					try {
						const depositTx = await synapse.depositUSDFC(neededAmount);
						console.log('Deposit transaction:', depositTx.hash);
						await depositTx.wait();
						console.log('✅ USDFC deposit confirmed');
					} catch (error: any) {
						console.log('Deposit failed. Proceeding with current balance...');
					}
				}

				// Approve the Warm Storage service to use USDFC tokens
				const warmStorageAddress = await synapse.getWarmStorageAddress();
				const approveTx = await synapse.approveService(
					warmStorageAddress,
					ethers.parseUnits('1', 18),    // Rate allowance: 1 USDFC per epoch
					ethers.parseUnits('9', 18),    // Lockup allowance: 9 USDFC total
					86400n                         // Max lockup period: 30 days
				);
				await approveTx.wait();
				console.log('✅ Service approval confirmed');

				// Prepare JSON data
			const bodyString = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData);
				const data = new TextEncoder().encode(bodyString);

				console.log('📄 Data being stored:', bodyString);
				console.log('📊 Data size:', data.length, 'bytes');
				console.log('🔍 Data type:', typeof jsonData);

				// Upload using Synapse SDK with timeout and progress tracking
				console.log('📤 Uploading to Filecoin...');
				console.log('⏱️ This may take 30-60 seconds for Filecoin storage...');
				
				const startTime = Date.now();
				const result = await synapse.uploadData(data);
				const uploadTime = Date.now() - startTime;
				
				const pieceCid = result.pieceCid.toString();
				console.log('✅ Upload complete! PieceCID:', pieceCid);
				console.log('⏱️ Upload time:', uploadTime, 'ms');

				// Clean up
				await synapse.cleanup();

				// Generate multiple access URLs for better reliability
				const ipfsUrls = [
					`https://ipfs.io/ipfs/${pieceCid}`,
					`https://gateway.pinata.cloud/ipfs/${pieceCid}`,
					`https://cloudflare-ipfs.com/ipfs/${pieceCid}`,
					`https://dweb.link/ipfs/${pieceCid}`
				];

				returnData.push({ 
					json: { 
						pieceCid, 
						fileName,
						dataSize: data.length,
						walletBalance: ethers.formatEther(walletBalance),
						usdfcBalance: ethers.formatEther(usdfcBalance),
						uploadTimeMs: uploadTime,
						ipfsUrls: ipfsUrls,
						primaryUrl: ipfsUrls[0],
						status: 'success',
						timestamp: new Date().toISOString()
					} 
				});

			} catch (error: any) {
				throw new NodeOperationError(this.getNode(), `Filecoin storage failed: ${error.message}`);
			}
		}

		return [returnData];
	}
}
