import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class Web3StorageApi implements ICredentialType {
	name = 'web3StorageApi';
	displayName = 'web3.storage API';
	documentationUrl = 'https://web3.storage/docs/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			default: '',
			required: true,
			typeOptions: { password: true },
			description: 'web3.storage API token',
		},
	];
}
