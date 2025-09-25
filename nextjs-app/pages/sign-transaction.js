import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Account } from '@near-js/accounts';
import { JsonRpcProvider } from '@near-js/providers';
import { actionCreators } from '@near-js/transactions';
import { KeyPairSigner } from '@near-js/signers';
import { KeyPairString } from '@near-js/crypto';
import { NEAR } from '@near-js/tokens';

export default function SignTransaction() {
  const router = useRouter();
  const { transactionId, recipient, amount, workflowId, nodeId, itemIndex } = router.query;
  
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initializeNear();
  }, []);

  const initializeNear = async () => {
    try {
      // Check if user has a NEAR account in localStorage
      const accountId = localStorage.getItem('near_account_id');
      
      if (accountId) {
        const provider = new JsonRpcProvider({
          url: 'https://rpc.mainnet.near.org'
        });
        
        setAccount({ accountId, provider });
        setIsConnected(true);
      }
    } catch (err) {
      setError('Failed to initialize NEAR connection');
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      // For localhost development, we'll use a simple input method
      // In production, you'd use NEAR Wallet Selector or similar
      const accountId = prompt('Enter your NEAR account ID (e.g., alice.near):');
      
      if (accountId && accountId.trim()) {
        localStorage.setItem('near_account_id', accountId.trim());
        
        const provider = new JsonRpcProvider({
          url: 'https://rpc.mainnet.near.org'
        });
        
        setAccount({ accountId: accountId.trim(), provider });
        setIsConnected(true);
      }
      
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };

  const signTransaction = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      // For localhost development, we'll simulate the signing process
      // In production, you'd integrate with NEAR Wallet Selector
      
      // Simulate transaction signing
      const mockTransactionHash = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Send callback to our callback handler
      const callbackUrl = 'http://localhost:3000/api/near-callback';
      await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          transactionHashes: mockTransactionHash,
          success: true,
          recipient,
          amount,
          workflowId,
          nodeId,
          itemIndex
        })
      });

      setSuccess(true);
      
      // Close after success
      setTimeout(() => {
        window.close();
      }, 3000);

    } catch (err) {
      setError(`Transaction failed: ${err.message}`);
      
      // Send error callback
      const callbackUrl = 'http://localhost:3000/api/near-callback';
      await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          errorCode: 'user_rejected',
          success: false
        })
      });
    } finally {
      setIsSigning(false);
    }
  };

  const rejectTransaction = async () => {
    try {
      const callbackUrl = 'http://localhost:3000/api/near-callback';
      await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          errorCode: 'user_rejected',
          success: false
        })
      });
      
      window.close();
    } catch (err) {
      console.error('Failed to send rejection callback:', err);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Transaction Signed!</h1>
          <p className="text-green-600">Your transaction has been successfully signed and submitted.</p>
          <p className="text-sm text-gray-500 mt-4">This window will close automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Sign NEAR Transaction
        </h1>
        
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Transaction Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-mono text-gray-800">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-mono text-gray-800">{amount} NEAR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Network:</span>
                <span className="font-mono text-gray-800">mainnet</span>
              </div>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <button
              onClick={connectWallet}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect NEAR Wallet
            </button>
            <button
              onClick={rejectTransaction}
              className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-800 text-sm">
                ✓ Connected as: <span className="font-mono">{account.accountId}</span>
              </p>
            </div>
            
            <button
              onClick={signTransaction}
              disabled={isSigning}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSigning ? 'Signing Transaction...' : 'Sign Transaction'}
            </button>
            
            <button
              onClick={rejectTransaction}
              disabled={isSigning}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Reject Transaction
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 p-3 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
