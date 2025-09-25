import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class NearApi implements ICredentialType {
	name = 'nearApi';
	displayName = 'NEAR API';
	documentationUrl = 'https://docs.near.org/';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			default: 'mainnet',
			options: [
				{ name: 'Mainnet', value: 'mainnet' },
				{ name: 'Testnet', value: 'testnet' },
			],
			description: 'NEAR network to connect to',
		},
		{
			displayName: 'Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			required: true,
			description: 'NEAR account ID used for headless execution',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			default: '',
			required: true,
			typeOptions: { password: true },
			description: 'Full private key string, e.g., ed25519:...',
		},
	];
}
