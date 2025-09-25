// Synapse SDK wrapper for CommonJS compatibility

interface SynapseInstance {
  payments: {
    walletBalance(): Promise<bigint>;
    balance(): Promise<bigint>;
    deposit(amount: bigint): Promise<any>;
    approveService(address: string, rateAllowance: bigint, lockupAllowance: bigint, maxLockupPeriod: bigint): Promise<any>;
  };
  getWarmStorageAddress(): string;
  storage: {
    upload(data: Uint8Array): Promise<{ pieceCid: any }>;
    download(pieceCid: string): Promise<Uint8Array>;
  };
  getProvider(): any;
}

class SynapseWrapper {
  private synapse: SynapseInstance | null = null;

  async initialize(privateKey: string, rpcURL: string): Promise<void> {
    try {
      console.log('🔄 Loading Synapse SDK via dynamic import...');
      
      // Use dynamic import with proper error handling
      const SynapseModule = await import('@filoz/synapse-sdk');
      
      // Extract Synapse class from the module
      const Synapse = SynapseModule.Synapse;
      
      if (!Synapse) {
        console.log('Available exports:', Object.keys(SynapseModule));
        throw new Error('Synapse class not found in module exports');
      }
      
      console.log('✅ Synapse class found, creating instance...');
      this.synapse = await Synapse.create({ privateKey, rpcURL });
      console.log('🎉 Synapse SDK initialized successfully!');
      
    } catch (error: any) {
      console.error('❌ Dynamic import failed:', error.message);
      
      // Try alternative import paths
      try {
        console.log('🔄 Trying alternative import path...');
        const SynapseModuleAlt = await import('@filoz/synapse-sdk/dist/index.js');
        const Synapse = SynapseModuleAlt.Synapse;
        
        if (!Synapse) {
          throw new Error('Synapse class not found in alternative import');
        }
        
        console.log('✅ Alternative import successful, creating instance...');
        this.synapse = await Synapse.create({ privateKey, rpcURL });
        console.log('🎉 Synapse SDK initialized successfully via alternative path!');
        
      } catch (altError: any) {
        console.error('❌ Alternative import also failed:', altError.message);
        
        // Try using eval to bypass module resolution
        try {
          console.log('🔄 Trying eval-based import...');
          
          // Create a dynamic import using eval to bypass CommonJS restrictions
          const importCode = `
            (async () => {
              const { Synapse } = await import('@filoz/synapse-sdk');
              return Synapse;
            })()
          `;
          
          const Synapse = await eval(importCode);
          
          if (!Synapse) {
            throw new Error('Synapse class not found in eval import');
          }
          
          console.log('✅ Eval import successful, creating instance...');
          this.synapse = await Synapse.create({ privateKey, rpcURL });
          console.log('🎉 Synapse SDK initialized successfully via eval!');
          
        } catch (evalError: any) {
          // Check if it's a runtime error (SDK loaded but invalid credentials) vs import error
          if (evalError.message.includes('invalid private key') || 
              evalError.message.includes('INVALID_ARGUMENT') ||
              evalError.message.includes('invalid address') ||
              evalError.message.includes('network') ||
              evalError.message.includes('connection')) {
            // This means the SDK loaded successfully but had runtime issues
            console.log('✅ Synapse SDK loaded successfully via eval!');
            console.log('⚠️ Runtime error (expected with invalid credentials):', evalError.message);
            throw new Error(`Synapse SDK loaded successfully but runtime error: ${evalError.message}`);
          } else {
            console.error('❌ Eval import failed:', evalError.message);
            throw new Error(`Failed to load Synapse SDK. All methods failed:
1. Dynamic import: ${error.message}
2. Alternative path: ${altError.message}  
3. Eval import: ${evalError.message}

The Synapse SDK requires ES module support. Please ensure your Node.js version supports dynamic imports.`);
          }
        }
      }
    }
  }

  async getWalletBalance(): Promise<bigint> {
    if (!this.synapse) throw new Error('Synapse not initialized');
    return await this.synapse.payments.walletBalance();
  }

  async getUSDFCBalance(): Promise<bigint> {
    if (!this.synapse) throw new Error('Synapse not initialized');
    return await this.synapse.payments.balance();
  }

  async depositUSDFC(amount: bigint): Promise<any> {
    if (!this.synapse) throw new Error('Synapse not initialized');
    return await this.synapse.payments.deposit(amount);
  }

  async approveService(address: string, rateAllowance: bigint, lockupAllowance: bigint, maxLockupPeriod: bigint): Promise<any> {
    if (!this.synapse) throw new Error('Synapse not initialized');
    return await this.synapse.payments.approveService(address, rateAllowance, lockupAllowance, maxLockupPeriod);
  }

  async getWarmStorageAddress(): Promise<string> {
    if (!this.synapse) throw new Error('Synapse not initialized');
    return this.synapse.getWarmStorageAddress();
  }

  async uploadData(data: Uint8Array): Promise<{ pieceCid: any }> {
    if (!this.synapse) throw new Error('Synapse not initialized');
    return await this.synapse.storage.upload(data);
  }

  async retrieveData(pieceCid: string): Promise<Uint8Array> {
    if (!this.synapse) throw new Error('Synapse not initialized');
    return await this.synapse.storage.download(pieceCid);
  }

  async cleanup(): Promise<void> {
    if (this.synapse) {
      const provider = this.synapse.getProvider();
      if (provider && typeof provider.destroy === 'function') {
        await provider.destroy();
      }
    }
  }
}

export { SynapseWrapper };
