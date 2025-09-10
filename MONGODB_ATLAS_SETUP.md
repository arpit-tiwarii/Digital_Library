# MongoDB Atlas IP Whitelist Setup

## 🔧 Fix Connection Issue

Your backend can't connect to MongoDB Atlas because your IP address isn't whitelisted.

### **Quick Fix Steps:**

1. **Go to MongoDB Atlas Dashboard**
   - Visit: https://cloud.mongodb.com/
   - Login to your account

2. **Navigate to Network Access**
   - Click "Network Access" in the left sidebar
   - You'll see your current IP whitelist

3. **Add Your Current IP**
   - Click "Add IP Address"
   - Choose one option:
     - **Current IP**: Click "Add Current IP Address"
     - **Allow All**: Use `0.0.0.0/0` (for development only)

4. **Save and Wait**
   - Click "Confirm"
   - Wait 1-2 minutes for changes to propagate

### **Alternative: Get Your Current IP**
Run this command to find your public IP:
```bash
curl ifconfig.me
```

Then manually add it to Atlas Network Access.

### **For Production Deployment**
- Never use `0.0.0.0/0` in production
- Add specific server IP addresses
- Use VPC peering for enhanced security

## 🔍 Verify Connection
After whitelisting, your backend should connect successfully without the IP whitelist error.
