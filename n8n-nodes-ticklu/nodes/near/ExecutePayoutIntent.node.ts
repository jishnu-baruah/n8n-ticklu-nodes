import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError, ApplicationError } from 'n8n-workflow';
import axios from 'axios';
import { Account } from '@near-js/accounts';
import { JsonRpcProvider } from '@near-js/providers';
import { actionCreators } from '@near-js/transactions';
import { KeyPairSigner } from '@near-js/signers';
import { KeyPairString } from '@near-js/crypto';
import { NEAR } from '@near-js/tokens';

export class ExecutePayoutIntent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NEAR: Execute Payout Intent',
		name: 'tickluNearExecutePayout',
		icon: 'file:near.svg',
		group: ['transform'],
		version: 2,
		subtitle: '',
		description: 'Execute headless NEAR transfers via the 1-Click API or direct ChainWeaver signing.',
		codex: {
			categories: ['Ticklu'],
			alias: ['Ticklu', 'NEAR', 'Blockchain', 'Web3'],
		},
		defaults: {
			name: 'Execute NEAR Payout',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'tickluCredentialsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Credentials',
				name: 'credentials',
				type: 'credentials',
				typeOptions: {
					credentialType: 'tickluCredentials',
				},
				required: true,
				default: '',
				description: 'Ticklu credentials containing API keys for approval mode or account details for headless mode',
			},
			{
				displayName: 'Execution Mode',
				name: 'executionMode',
				type: 'options',
				options: [
					{ name: 'Generate Approval Link (Recommended)', value: 'approval' },
					{ name: 'Human Signing (Wallet)', value: 'human_signing' },
					{ name: 'Headless Execution (Advanced)', value: 'headless' },
				],
				default: 'approval',
				required: true,
				description: 'The execution mode to use',
			},
			{
				displayName: 'Warning',
				name: 'headlessWarning',
				type: 'notice',
				typeOptions: { 
					style: 'warning',
					text: 'WARNING: Headless mode signs transactions directly and will spend real funds. Use a dedicated bot account.'
				},
				displayOptions: { show: { executionMode: ['headless'] } },
				default: '',
			},
			{
				displayName: 'Human Signing Info',
				name: 'humanSigningInfo',
				type: 'notice',
				typeOptions: { 
					style: 'info',
					text: 'Human signing mode generates a NEAR Wallet URL for user approval. The workflow will pause until the user signs the transaction.'
				},
				displayOptions: { show: { executionMode: ['human_signing'] } },
				default: '',
			},
			{
				displayName: 'Recipient Address',
				name: 'recipientAddress',
				type: 'string',
				default: '',
				placeholder: 'contributor.near',
				required: true,
				description: 'The NEAR account ID of the recipient',
			},
			{
				displayName: 'Amount (in NEAR)',
				name: 'inputAmount',
				type: 'number',
				typeOptions: { numberPrecision: 8 },
				default: 0,
				placeholder: '50',
				required: true,
				description: 'The amount to send in NEAR',
			},
			{
				displayName: 'Refund Address',
				name: 'refundAddress',
				type: 'string',
				default: '',
				placeholder: 'my-account.near',
				required: true,
				description: 'The NEAR account ID for refunds (used in approval mode)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const executionMode = this.getNodeParameter('executionMode', i) as 'approval' | 'headless' | 'human_signing';
				const inputAmount = this.getNodeParameter('inputAmount', i) as number;
				const recipientAddress = this.getNodeParameter('recipientAddress', i) as string;
				const refundAddress = this.getNodeParameter('refundAddress', i) as string;

			// Get unified credentials
			const creds = await this.getCredentials('tickluCredentials');
			if (!creds) {
				throw new NodeOperationError(this.getNode(), 'Missing Ticklu credentials');
			}

			if (executionMode === 'approval') {
				// Approval mode: Get quote from 1-Click API
				const apiBaseUrl = (creds as any).apiBaseUrl as string;
				const jwt = (creds as any).jwt as string;
				
				if (!apiBaseUrl || !jwt) {
					throw new NodeOperationError(this.getNode(), 'Missing API Base URL or JWT for approval mode');
				}

				const quoteBody = {
					input_token: 'NEAR.mainnet',
					input_amount: inputAmount,
					output_token: 'NEAR.mainnet', // same chain payout for NEAR intent
					output_address: recipientAddress,
					refund_address: refundAddress,
				};

				const quoteUrl = `${apiBaseUrl.replace(/\/$/, '')}/v0/quote`;
				const quoteResponse = await axios.post(quoteUrl, quoteBody, {
					headers: { Authorization: `Bearer ${jwt}` },
				});

				const { deposit_address: depositAddress, input_amount: requiredAmount } = quoteResponse.data || {};
				if (!depositAddress || requiredAmount === undefined) {
					throw new NodeOperationError(this.getNode(), 'Invalid quote response: missing deposit_address or input_amount');
				}

				const approvalLink = `https://wallet.near.org/send-money/${depositAddress}/${requiredAmount}`;
				returnData.push({ 
					json: { mode: 'approval', quote: quoteResponse.data, approvalLink },
					pairedItem: { item: i }
				});
				continue;
			}

			if (executionMode === 'human_signing') {
				// Human signing mode: Generate NEAR Wallet signing URL
				const callbackUrl = (creds as any).callbackUrl as string;
				
				if (!callbackUrl) {
					throw new NodeOperationError(this.getNode(), 'Missing Callback URL for human signing mode');
				}

				// Generate signing page URL
				const signingUrl = await ExecutePayoutIntent.generateSigningPageUrl({
					recipientAddress,
					amount: inputAmount,
					callbackUrl,
					workflowId: this.getWorkflow().id || 'unknown',
					nodeId: this.getNode().id,
					itemIndex: i
				});

				returnData.push({ 
					json: { 
						mode: 'human_signing', 
						signingUrl,
						status: 'pending',
						message: 'Transaction ready for user approval. Share the signing URL with the user.'
					},
					pairedItem: { item: i }
				});
				continue;
			}

			// Headless execution using new NEAR SDK
			const accountId = (creds as any).accountId as string;
			const privateKey = (creds as any).privateKey as string;
			
			if (!accountId || !privateKey) {
				throw new NodeOperationError(this.getNode(), 'Missing Account ID or Private Key for headless mode');
			}

			// Use new NEAR SDK for headless execution
			const result = await ExecutePayoutIntent.executeHeadlessTransaction({
				accountId,
				privateKey,
				recipientAddress,
				amount: inputAmount
			});

			returnData.push({ 
				json: { 
					mode: 'headless', 
					status: 'success', 
					transactionHash: result.transactionHash,
					explorerUrl: result.explorerUrl,
					response: result
				},
				pairedItem: { item: i }
			});

			} catch (error) {
				// Handle API call failures gracefully
				if (axios.isAxiosError(error)) {
					const errorMessage = error.response?.data?.message || error.message || 'API call failed';
					const statusCode = error.response?.status || 'Unknown';
					
					throw new NodeOperationError(this.getNode(), `Ticklu Error (${statusCode}): ${errorMessage}`);
				} else {
					throw new NodeOperationError(this.getNode(), `Ticklu Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
				}
			}
		}

		return [returnData];
	}

	private static async generateSigningPageUrl(params: {
		recipientAddress: string;
		amount: number;
		callbackUrl: string;
		workflowId: string;
		nodeId: string;
		itemIndex: number;
	}): Promise<string> {
		const { recipientAddress, amount, workflowId, nodeId, itemIndex } = params;
		
		// Generate a unique transaction ID
		const transactionId = `tx_${workflowId}_${nodeId}_${itemIndex}_${Date.now()}`;
		
		// Generate Next.js signing page URL with transaction details
		// Use localhost:3001 for the Next.js app
		const signingUrl = `http://localhost:3001/sign-transaction?` + new URLSearchParams({
			transactionId,
			recipient: recipientAddress,
			amount: amount.toString(),
			network: 'mainnet',
			workflowId,
			nodeId,
			itemIndex: itemIndex.toString()
		}).toString();
		
		return signingUrl;
	}

	private static async executeHeadlessTransaction(params: {
		accountId: string;
		privateKey: string;
		recipientAddress: string;
		amount: number;
	}): Promise<{ transactionHash: string; explorerUrl: string }> {
		const { accountId, privateKey, recipientAddress, amount } = params;
		
		// Try multiple RPC providers for better reliability
		const rpcUrls = [
			'https://rpc.fastnear.com',
			'https://near.lava.build',
			'https://rpc.mainnet.near.org',
			'https://rpc.near.org'
		];
		
		let provider: JsonRpcProvider;
		let lastError: Error | null = null;
		
		// Try each RPC provider until one works
		for (const rpcUrl of rpcUrls) {
			try {
				console.log(`🔄 Trying RPC provider: ${rpcUrl}`);
				provider = new JsonRpcProvider({ url: rpcUrl });
				
				// Test the connection
				await provider.status();
				console.log(`✅ Connected to RPC provider: ${rpcUrl}`);
				break;
			} catch (error) {
				console.log(`❌ Failed to connect to ${rpcUrl}:`, error instanceof Error ? error.message : 'Unknown error');
				lastError = error instanceof Error ? error : new Error('Unknown error');
				continue;
			}
		}
		
		if (!provider!) {
			throw new ApplicationError(`Failed to connect to any RPC provider. Last error: ${lastError?.message}`);
		}
		
		// Create signer from private key
		const signer = KeyPairSigner.fromSecretKey(privateKey as KeyPairString);
		
		// Create account
		const account = new Account(accountId, provider, signer);
		
		// Convert amount to yoctoNEAR
		const amountInYoctoNEAR = NEAR.toUnits(amount.toString());
		
		// Execute transaction
		const { transaction } = await account.signAndSendTransaction({
			receiverId: recipientAddress,
			actions: [
				actionCreators.transfer(amountInYoctoNEAR)
			],
			waitUntil: 'INCLUDED_FINAL'
		});
		
		return {
			transactionHash: transaction.hash,
			explorerUrl: `https://nearblocks.io/txns/${transaction.hash}`
		};
	}
}
