import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FilecoinCredentialsApi implements ICredentialType {
	name = 'filecoinCredentialsApi';
	displayName = 'Filecoin Credentials API';
	documentationUrl = 'https://docs.filecoin.io/';
	properties: INodeProperties[] = [
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The private key for the Filecoin wallet (required for Synapse SDK)',
		},
		{
			displayName: 'WebSocket RPC URL',
			name: 'wsRpcUrl',
			type: 'string',
			default: 'https://api.calibration.node.glif.io/rpc/v1',
			required: true,
			description: 'WebSocket RPC URL for Filecoin network (Calibration testnet by default)',
		},
	];
}
