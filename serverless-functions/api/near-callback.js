// Vercel/Netlify serverless function for NEAR Wallet callbacks
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { 
      transactionHashes, 
      errorCode, 
      workflowId, 
      nodeId, 
      itemIndex,
      // Additional params for our custom flow
      transactionId,
      signature
    } = req.method === 'GET' ? req.query : req.body;

    console.log('Received NEAR callback:', {
      transactionHashes,
      errorCode,
      workflowId,
      nodeId,
      itemIndex,
      transactionId,
      signature
    });

    // Validate required parameters
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: transactionId'
      });
    }

    // Prepare callback data
    const callbackData = {
      transactionId,
      workflowId: workflowId || null,
      nodeId: nodeId || null,
      itemIndex: itemIndex ? parseInt(itemIndex) : null,
      timestamp: new Date().toISOString(),
      success: !errorCode,
      transactionHashes: transactionHashes ? transactionHashes.split(',') : [],
      errorCode: errorCode || null,
      signature: signature || null,
      status: errorCode ? 'rejected' : 'completed'
    };

    // Store the result (in production, use a database)
    await storeTransactionResult(callbackData);

    // If you have an n8n webhook URL configured, send the data there
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && workflowId && nodeId) {
      try {
        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(callbackData),
          signal: AbortSignal.timeout(10000)
        });
        
        if (!webhookResponse.ok) {
          console.error('Webhook failed:', webhookResponse.status);
        } else {
          console.log('Successfully sent callback to n8n webhook');
        }
      } catch (webhookError) {
        console.error('Failed to send callback to n8n webhook:', webhookError.message);
        // Don't fail the callback if webhook fails
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Transaction callback processed successfully',
      data: callbackData
    });

  } catch (error) {
    console.error('Error processing NEAR callback:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Helper function to store transaction results
async function storeTransactionResult(data) {
  // In production, use a database like Supabase, PlanetScale, or MongoDB
  const storageUrl = process.env.TRANSACTION_STORAGE_URL;
  if (storageUrl) {
    try {
      await fetch(`${storageUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to store transaction result:', error);
    }
  }
  
  // Alternative: Use Vercel KV or similar
  // await kv.set(`transaction:${data.transactionId}`, data, { ex: 3600 });
}

