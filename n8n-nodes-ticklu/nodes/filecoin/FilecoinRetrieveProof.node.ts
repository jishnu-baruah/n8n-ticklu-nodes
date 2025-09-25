import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError } from 'n8n-workflow';
import { SynapseWrapper } from './SynapseWrapper';

export class FilecoinRetrieveProof implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Filecoin: Retrieve Proof',
		name: 'tickluFilecoinRetrieveProof',
		icon: 'file:filecoin.svg',
		group: ['transform'],
		version: 1,
		description: 'Retrieves JSON data from Filecoin via Synapse SDK using PieceCID.',
		defaults: { name: 'Retrieve Proof from Filecoin' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'filecoinCredentialsApi', required: true }],
		properties: [
			{ 
				displayName: 'PieceCID', 
				name: 'pieceCid', 
				type: 'string', 
				default: '', 
				required: true,
				description: 'The PieceCID of the data to retrieve from Filecoin'
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
			const pieceCid = this.getNodeParameter('pieceCid', itemIndex) as string;

			const creds = await this.getCredentials('filecoinCredentials');
			if (!creds) {
				throw new NodeOperationError(this.getNode(), 'Missing Filecoin credentials');
			}
			const privateKey = (creds as any).privateKey as string;
			const wsRpcUrl = (creds as any).wsRpcUrl as string;

			if (!privateKey) {
				throw new NodeOperationError(this.getNode(), 'Private key is required for Filecoin operations');
			}

			if (!pieceCid) {
				throw new NodeOperationError(this.getNode(), 'PieceCID is required to retrieve data');
			}

			try {
				console.log('🔍 Retrieving data from Filecoin...');
				console.log('📋 PieceCID:', pieceCid);
				
				// Initialize Synapse SDK wrapper
				const synapse = new SynapseWrapper();
				await synapse.initialize(privateKey, wsRpcUrl || 'https://api.calibration.node.glif.io/rpc/v1');

				// Retrieve the data
				const startTime = Date.now();
				const data = await synapse.retrieveData(pieceCid);
				const retrieveTime = Date.now() - startTime;

				// Convert back to text first to debug
				const textString = new TextDecoder().decode(data);
				console.log('🔍 Raw retrieved data:', textString);
				console.log('📄 Data size:', data.length, 'bytes');
				console.log('⏱️ Retrieve time:', retrieveTime, 'ms');

				// Try to parse as JSON
				let jsonData;
				try {
					jsonData = JSON.parse(textString);
					console.log('✅ Data parsed as JSON successfully!');
				} catch (parseError: any) {
					console.log('⚠️ Data is not valid JSON, returning as text');
					console.log('Parse error:', parseError.message);
					jsonData = {
						rawData: textString,
						isJson: false,
						parseError: parseError.message
					};
				}

				// Clean up
				await synapse.cleanup();

				// Generate access URLs
				const ipfsUrls = [
					`https://ipfs.io/ipfs/${pieceCid}`,
					`https://gateway.pinata.cloud/ipfs/${pieceCid}`,
					`https://cloudflare-ipfs.com/ipfs/${pieceCid}`,
					`https://dweb.link/ipfs/${pieceCid}`
				];

				returnData.push({ 
					json: { 
						pieceCid,
						retrievedData: jsonData,
						rawData: textString,
						dataSize: data.length,
						retrieveTimeMs: retrieveTime,
						ipfsUrls: ipfsUrls,
						primaryUrl: ipfsUrls[0],
						status: 'success',
						timestamp: new Date().toISOString()
					} 
				});

			} catch (error: any) {
				throw new NodeOperationError(this.getNode(), `Filecoin retrieval failed: ${error.message}`);
			}
		}

		return [returnData];
	}
}
