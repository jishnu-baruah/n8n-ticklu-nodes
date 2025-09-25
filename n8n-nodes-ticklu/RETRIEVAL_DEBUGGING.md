# 🔍 Filecoin Data Retrieval Debugging Guide

## 🚨 **Issue Identified:**

The error `"Unexpected token 'm', "mode: head"... is not valid JSON"` indicates that:

1. **The retrieved data is not valid JSON format**
2. **The data might be in a different format than expected**
3. **There could be a PieceCID mismatch**

## 🔧 **Solutions Implemented:**

### **Enhanced Retrieval Node:**
- ✅ **Raw Data Debugging**: Shows exactly what was retrieved
- ✅ **JSON Parsing Fallback**: Handles non-JSON data gracefully
- ✅ **Detailed Logging**: Shows data type, size, and content
- ✅ **Error Handling**: Provides clear error messages

### **Enhanced Storage Node:**
- ✅ **Data Format Logging**: Shows what's being stored
- ✅ **Data Type Detection**: Identifies input data type
- ✅ **Content Verification**: Displays actual stored content

## 🎯 **How to Debug:**

### **Step 1: Check What Was Actually Stored**
When you run the storage node again, look for these logs:
```
📄 Data being stored: [actual content]
📊 Data size: [size in bytes]
🔍 Data type: [string/object]
```

### **Step 2: Check What Was Retrieved**
When you run the retrieval node, look for these logs:
```
🔍 Raw retrieved data: [actual retrieved content]
📄 Data size: [size in bytes]
⏱️ Retrieve time: [time in ms]
```

### **Step 3: Compare the Data**
- **If stored data ≠ retrieved data**: PieceCID mismatch
- **If data format is different**: Storage/retrieval format issue
- **If data is corrupted**: Network/storage issue

## 🔍 **Possible Causes:**

### **1. PieceCID Mismatch**
- **Cause**: Using wrong PieceCID for retrieval
- **Solution**: Double-check the PieceCID from storage output

### **2. Data Format Issue**
- **Cause**: Data stored in non-JSON format
- **Solution**: Check what format was actually stored

### **3. Network/Storage Corruption**
- **Cause**: Data corrupted during storage/retrieval
- **Solution**: Try storing/retrieving again

### **4. Synapse SDK Issue**
- **Cause**: SDK storage/retrieval inconsistency
- **Solution**: Use IPFS gateways as backup

## 🚀 **Immediate Actions:**

### **Action 1: Test with New Data**
1. **Store new data** with the enhanced storage node
2. **Check the logs** to see what's actually stored
3. **Use the exact PieceCID** for retrieval
4. **Check retrieval logs** to see what's retrieved

### **Action 2: Verify PieceCID**
Make sure you're using the **exact PieceCID** from the storage output:
```
pieceCid: bafkzcibcgib6tkuu44sih75rrehvim7jdwn2gqp4l3yicow7zdx4jd3yceagylq
```

### **Action 3: Check Data Format**
The error suggests the data starts with `"mode: head"` which looks like:
- **Template string** instead of actual data
- **n8n expression** that wasn't resolved
- **Different data format** than expected

## 💡 **Quick Fix:**

### **If Data Contains Template Strings:**
The issue might be that n8n template expressions like `{{ $json.mode }}` weren't resolved. Make sure your input data is:
- **Actual resolved data**, not template strings
- **Valid JSON format**
- **Properly formatted**

### **Example of Correct Input:**
```json
{
  "mode": "headless",
  "status": "success",
  "transactionHash": "HhLQcS1zN7uxhc1LEY3mGWCf9iyyd4BkhrUHV1RvUFpA"
}
```

### **Example of Incorrect Input:**
```
Mode:{{ $json.mode }}
Status:{{ $json.status }}
transactionHash:{{ $json.transactionHash }}
```

## 🎯 **Next Steps:**

1. **Run storage node** with proper JSON data
2. **Check the logs** for actual stored content
3. **Use exact PieceCID** for retrieval
4. **Check retrieval logs** for retrieved content
5. **Compare stored vs retrieved** data

The enhanced debugging will show you exactly what's happening at each step!
