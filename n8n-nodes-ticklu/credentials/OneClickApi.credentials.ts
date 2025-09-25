import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class OneClickApi implements ICredentialType {
	name = 'oneClickApi';
	displayName = '1-Click API';
	documentationUrl = 'https://docs.1click.near.org/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'apiBaseUrl',
			type: 'string',
			default: 'https://api.1click.near.org',
			required: true,
			description: 'Base URL for the 1-Click API',
		},
		{
			displayName: 'JWT',
			name: 'jwt',
			type: 'string',
			default: '',
			required: true,
			typeOptions: { password: true },
			description: 'Bearer token used to authorize API requests',
		},
	];
}
