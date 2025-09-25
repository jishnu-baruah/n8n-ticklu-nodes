# 🚀 Publishing Ticklu n8n Nodes Guide

## 📋 **Publishing Options:**

### **Option 1: npm Package (Recommended)** ⭐

#### **Step 1: Prepare for Publishing**
```bash
# Update package.json (already done)
# Build the project
npm run build

# Test the build
npm run lint
```

#### **Step 2: Create npm Account**
1. Go to [npmjs.com](https://www.npmjs.com)
2. Create account or login
3. Verify email address

#### **Step 3: Login to npm**
```bash
npm login
```

#### **Step 4: Publish to npm**
```bash
# Dry run first (test without publishing)
npm publish --dry-run

# If dry run looks good, publish
npm publish
```

#### **Step 5: Install in n8n**
Users can install with:
```bash
npm install n8n-nodes-ticklu
```

### **Option 2: GitHub Package Registry**

#### **Step 1: Create GitHub Repository**
1. Create repo: `https://github.com/ticklu/n8n-nodes-ticklu`
2. Push your code
3. Create releases

#### **Step 2: Configure Package**
```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

#### **Step 3: Publish**
```bash
npm publish
```

### **Option 3: Direct Installation**

#### **For Local Development:**
```bash
# Link package locally
npm link

# In n8n directory
npm link n8n-nodes-ticklu
```

#### **For Production:**
```bash
# Copy dist folder to n8n nodes directory
cp -r dist/ /path/to/n8n/nodes/
```

## 🎯 **Recommended Publishing Steps:**

### **1. Final Preparation**
```bash
# Build everything
npm run build

# Run linting
npm run lint

# Test locally
npm run dev
```

### **2. Update Documentation**
Create a comprehensive README.md:

```markdown
# Ticklu n8n Nodes

## Features
- NEAR blockchain transactions
- Filecoin storage with Synapse SDK
- Multi-provider RPC support
- Enhanced error handling

## Installation
npm install n8n-nodes-ticklu

## Usage
[Add usage examples]
```

### **3. Create GitHub Repository**
1. Create `https://github.com/ticklu/n8n-nodes-ticklu`
2. Push your code
3. Create releases for versions

### **4. Publish to npm**
```bash
# Login to npm
npm login

# Publish
npm publish
```

### **5. Submit to n8n Community**
1. Go to [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
2. Submit your package
3. Get listed in n8n documentation

## 📦 **Package Contents:**

Your published package includes:
- ✅ **3 Nodes**: NEAR Payout, Filecoin Store, Filecoin Retrieve
- ✅ **3 Credentials**: Ticklu, Web3Storage, Filecoin
- ✅ **Enhanced Features**: Multi-RPC, error handling, debugging
- ✅ **Dependencies**: All required packages included

## 🔧 **Pre-Publishing Checklist:**

- [ ] ✅ Package.json updated with proper metadata
- [ ] ✅ All nodes built successfully
- [ ] ✅ Linting passes
- [ ] ✅ Dependencies properly configured
- [ ] ✅ README.md created
- [ ] ✅ GitHub repository created
- [ ] ✅ npm account ready
- [ ] ✅ Tested locally

## 🎉 **After Publishing:**

### **Users can install with:**
```bash
npm install n8n-nodes-ticklu
```

### **Then use in n8n:**
1. Restart n8n
2. Nodes appear in "Ticklu" category
3. Configure credentials
4. Start building workflows!

## 💡 **Pro Tips:**

1. **Version Management**: Use semantic versioning (1.0.0, 1.1.0, etc.)
2. **Documentation**: Include examples and troubleshooting
3. **Community**: Engage with n8n community for feedback
4. **Updates**: Regular updates based on user feedback

**Ready to publish your amazing Ticklu nodes!** 🚀
