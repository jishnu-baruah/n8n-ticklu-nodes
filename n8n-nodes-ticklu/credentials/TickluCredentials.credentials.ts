import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TickluCredentialsApi implements ICredentialType {
	name = 'tickluCredentialsApi';
	displayName = 'Ticklu Credentials API';
	documentationUrl = 'https://docs.ticklu.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'apiBaseUrl',
			type: 'string',
			default: 'https://api.1click.near.org',
			required: false,
			description: 'Base URL for the 1-Click API (required for approval mode)',
		},
		{
			displayName: 'JWT',
			name: 'jwt',
			type: 'string',
			default: '',
			required: false,
			typeOptions: { password: true },
			description: 'Bearer token for 1-Click API (required for approval mode)',
		},
		{
			displayName: 'Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			placeholder: 'my-dao-bot.near',
			required: false,
			description: 'The NEAR account ID of the bot wallet (required for headless mode)',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'The private key for the bot wallet (required for headless mode)',
		},
		{
			displayName: 'Callback URL',
			name: 'callbackUrl',
			type: 'string',
			default: '',
			required: false,
			placeholder: 'https://your-domain.com/api/near-callback',
			description: 'URL to receive signed transaction results (required for human signing mode)',
		},
	];
}

