const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store for workflow states (in production, use Redis or database)
const workflowStates = new Map();

/**
 * NEAR Wallet Callback Handler
 * This endpoint receives callbacks from NEAR Wallet after user signs transactions
 * Supports both GET (from NEAR Wallet) and POST (from Next.js page) requests
 */
app.all('/api/near-callback', async (req, res) => {
  try {
    // Handle both GET and POST requests
    const data = req.method === 'GET' ? req.query : req.body;
    
    const { 
      transactionHashes, 
      errorCode, 
      workflowId, 
      nodeId, 
      itemIndex,
      // New fields for improved flow
      transactionId,
      signature,
      recipient,
      amount,
      network
    } = data;

    console.log('Received NEAR callback:', {
      method: req.method,
      transactionHashes,
      errorCode,
      workflowId,
      nodeId,
      itemIndex,
      transactionId,
      signature,
      recipient,
      amount,
      network
    });

    // Generate transactionId if not provided (for backward compatibility)
    const finalTransactionId = transactionId || `tx_${workflowId || 'unknown'}_${nodeId || 'unknown'}_${itemIndex || 0}_${Date.now()}`;

    // Prepare callback data for n8n webhook
    const callbackData = {
      transactionId: finalTransactionId,
      workflowId: workflowId || null,
      nodeId: nodeId || null,
      itemIndex: itemIndex ? parseInt(itemIndex) : null,
      timestamp: new Date().toISOString(),
      success: !errorCode,
      transactionHashes: transactionHashes ? transactionHashes.split(',') : [],
      errorCode: errorCode || null,
      signature: signature || null,
      status: errorCode ? 'rejected' : 'completed',
      // Additional context
      recipient: recipient || null,
      amount: amount || null,
      network: network || 'mainnet'
    };

    // Store the result for potential webhook delivery
    const stateKey = finalTransactionId;
    workflowStates.set(stateKey, callbackData);

    // Also store by workflow context if available (for backward compatibility)
    if (workflowId && nodeId && itemIndex !== undefined) {
      const workflowKey = `${workflowId}-${nodeId}-${itemIndex}`;
      workflowStates.set(workflowKey, callbackData);
    }

    // For local development, we'll skip webhook and just log the result
    // In production, you can use ngrok or n8n tunnel for webhooks
    console.log('Callback data ready for n8n:', callbackData);
    
    // If you have an n8n webhook URL configured, send the data there
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && workflowId && nodeId) {
      try {
        await axios.post(n8nWebhookUrl, callbackData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        console.log('Successfully sent callback to n8n webhook');
      } catch (webhookError) {
        console.error('Failed to send callback to n8n webhook:', webhookError.message);
        console.log('You can manually check the result at: http://localhost:3000/api/callback-result/' + finalTransactionId);
        // Don't fail the callback if webhook fails
      }
    } else {
      console.log('No webhook configured. Check result manually at: http://localhost:3000/api/callback-result/' + finalTransactionId);
    }

    // Return success response
    res.json({
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
});

/**
 * Get callback result by transaction ID
 * This is the primary way to retrieve results in the new flow
 */
app.get('/api/callback-result/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  
  const result = workflowStates.get(transactionId);
  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'Callback result not found'
    });
  }

  res.json({
    success: true,
    data: result
  });
});

/**
 * Get callback result for a specific workflow/node/item (backward compatibility)
 */
app.get('/api/callback-result/:workflowId/:nodeId/:itemIndex', (req, res) => {
  const { workflowId, nodeId, itemIndex } = req.params;
  const stateKey = `${workflowId}-${nodeId}-${itemIndex}`;
  
  const result = workflowStates.get(stateKey);
  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'Callback result not found'
    });
  }

  res.json({
    success: true,
    data: result
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    storedStates: workflowStates.size
  });
});

/**
 * Get all stored workflow states (for debugging)
 */
app.get('/api/states', (req, res) => {
  const states = Array.from(workflowStates.entries()).map(([key, value]) => ({
    key,
    ...value
  }));
  
  res.json({
    success: true,
    count: states.length,
    states
  });
});

/**
 * Clear stored states (for testing)
 */
app.delete('/api/states', (req, res) => {
  workflowStates.clear();
  res.json({
    success: true,
    message: 'All stored states cleared'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`NEAR Callback Handler running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Callback endpoint: http://localhost:${PORT}/api/near-callback`);
  console.log(`Result endpoint: http://localhost:${PORT}/api/callback-result/:transactionId`);
});

module.exports = app;
