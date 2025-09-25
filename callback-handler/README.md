# NEAR Callback Handler

This is a simple Express.js server that handles callbacks from NEAR Wallet after users sign transactions in the human-in-the-loop flow.

## Features

- Receives callbacks from NEAR Wallet with transaction results
- Stores workflow state for n8n integration
- Optional webhook delivery to n8n
- Polling endpoint for callback results
- Health check and debugging endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (optional):
```bash
export N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/near-callback"
export PORT=3000
```

3. Start the server:
```bash
npm start
```

## Endpoints

### POST/GET `/api/near-callback`
Main callback endpoint that NEAR Wallet will redirect to after signing.

**Query Parameters:**
- `transactionHashes` - Comma-separated list of transaction hashes
- `errorCode` - Error code if transaction was rejected
- `workflowId` - n8n workflow ID
- `nodeId` - n8n node ID  
- `itemIndex` - Item index in the workflow

### GET `/api/callback-result/:workflowId/:nodeId/:itemIndex`
Retrieve callback result for a specific workflow execution.

### GET `/health`
Health check endpoint.

### GET `/api/states`
Get all stored workflow states (for debugging).

## Integration with n8n

1. **Configure Callback URL**: Set your callback handler URL in the Ticklu credentials:
   ```
   https://your-domain.com/api/near-callback
   ```

2. **Webhook Integration** (Optional): Set `N8N_WEBHOOK_URL` environment variable to automatically send results to an n8n webhook.

3. **Polling Integration**: Use the `/api/callback-result` endpoint to poll for results in your n8n workflow.

## Example n8n Workflow Integration

```javascript
// In your n8n workflow, after the human signing node:
const callbackUrl = 'https://your-callback-handler.com/api/callback-result';
const workflowId = $workflow.id;
const nodeId = $node.id;
const itemIndex = $itemIndex;

// Poll for result
const result = await axios.get(`${callbackUrl}/${workflowId}/${nodeId}/${itemIndex}`);
if (result.data.success) {
  // Process the signed transaction result
  const { transactionHashes, status } = result.data.data;
  // Continue workflow...
}
```

## Security Considerations

- Validate all incoming requests
- Use HTTPS in production
- Implement rate limiting
- Consider using Redis or a database for production state storage
- Add authentication if needed

## Production Deployment

For production deployment, consider:

1. **Database Storage**: Replace the in-memory Map with Redis or PostgreSQL
2. **Authentication**: Add API keys or JWT validation
3. **Rate Limiting**: Implement request rate limiting
4. **Monitoring**: Add logging and monitoring
5. **SSL/TLS**: Use HTTPS for all endpoints
6. **Load Balancing**: Use multiple instances behind a load balancer

