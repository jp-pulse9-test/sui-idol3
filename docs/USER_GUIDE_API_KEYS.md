# User Guide: Managing Your Gemini API Keys

## Overview

Sui Idol allows you to use your own Gemini API key for AI-powered features. Your API keys are stored securely using industry-standard encryption (SHA-256 hashing with salt). **Plaintext keys are never stored in our database.**

---

## 🔐 Security Features

✅ **One-Way Hashing** - Your API key is hashed before storage and cannot be recovered  
✅ **Salt Protection** - Prevents rainbow table attacks  
✅ **No Plaintext Storage** - Even if our database is compromised, your keys are safe  
✅ **Automatic Audit Logging** - All API key operations are logged for security  

---

## 📝 How to Add Your API Key

### Step 1: Get Your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIza...`)

### Step 2: Add to Sui Idol
1. Connect your wallet to Sui Idol
2. Navigate to Settings page
3. Find the "Gemini API Key Management" section
4. Paste your API key
5. Click "Save API Key"

✅ **Your key is now securely stored!**

---

## 🔄 Managing Your API Key

### Updating Your Key
1. Go to Settings
2. Enter your new API key in the same field
3. Click "Update API Key"
4. Your old key will be replaced with the new one

### Deleting Your Key
1. Go to Settings
2. Click the trash icon (🗑️) next to the API key field
3. Confirm deletion
4. Your key is permanently removed

---

## 🛡️ Security FAQs

### Q: Can you see my API key?
**A:** No. Your API key is hashed (encrypted one-way) before storage. We cannot see, retrieve, or recover your plaintext API key. Not even our database administrators can access it.

### Q: What if I forget my API key?
**A:** Because keys are hashed and cannot be recovered, you'll need to:
1. Delete your old key in Settings
2. Generate a new API key from Google AI Studio
3. Add the new key to Sui Idol

### Q: Is it safe to use my own API key?
**A:** Yes! We use the same security standards as major platforms:
- SHA-256 hashing (same as password storage best practices)
- Salted hashing (prevents rainbow table attacks)
- Row-Level Security (isolates your data from other users)
- Automatic audit logging (tracks all key operations)

### Q: Can other users see my API key?
**A:** No. Even other authenticated users cannot access your API key data. RLS policies ensure complete isolation.

### Q: What if I don't want to use my own API key?
**A:** You can use the system-wide API key provided by Sui Idol. However, your own key gives you:
- Better rate limits
- Personal usage tracking
- Independence from shared quotas

---

## 🔍 Technical Details (For Developers)

### How Keys Are Stored
```
Your plaintext key: AIzaSyD...
                    ↓
            SHA-256 Hashing
         (with unique salt)
                    ↓
Stored hash: a3f5e8b2c1d9...
```

### How Verification Works
```
You enter your key → We hash it → Compare with stored hash
                                         ↓
                                    Match = ✅ Verified
                                    No match = ❌ Invalid
```

### Database Security
- **RLS Policies:** Block all SELECT queries on API keys
- **Triggers:** Automatically hash keys on INSERT/UPDATE
- **Audit Logs:** Track create, update, delete operations
- **Encryption Version:** Tracks hashing algorithm (v2 = SHA-256)

---

## ⚠️ Important Notes

1. **Store Your Key Safely**
   - Because we hash keys, we cannot recover them
   - Keep a backup of your API key in a secure location
   - Consider using a password manager

2. **Key Security**
   - Never share your API key with others
   - Rotate your key regularly (every 3-6 months)
   - If compromised, delete and create a new one immediately

3. **Usage Monitoring**
   - Check your Google Cloud Console for API usage
   - Monitor for unexpected usage patterns
   - Set up billing alerts to avoid surprises

4. **Free Tier Limits**
   - Gemini API has free tier limits
   - Monitor your usage to avoid overages
   - Upgrade to paid tier if needed

---

## 🚨 What to Do If Your Key Is Compromised

1. **Immediately:**
   - Delete your key in Sui Idol Settings
   - Revoke the key in Google AI Studio
   - Check your Google Cloud usage logs

2. **Create New Key:**
   - Generate a new API key in Google AI Studio
   - Add the new key to Sui Idol
   - Update any other apps using the old key

3. **Monitor:**
   - Watch for unauthorized usage
   - Review audit logs in Sui Idol
   - Contact support if you notice suspicious activity

---

## 📞 Support

**Questions about API key security?**
- Review our [API Key Security Documentation](./API_KEY_SECURITY.md)
- Check the [Security Fixes Summary](./SECURITY_FIXES_SUMMARY.md)
- Contact support through the app

**Google API Issues?**
- Visit [Google AI Studio Support](https://support.google.com/googleapi/)
- Check [Gemini API Documentation](https://ai.google.dev/docs)

---

## 🎓 Best Practices

1. ✅ Use a strong, unique API key
2. ✅ Rotate keys every 3-6 months
3. ✅ Monitor usage regularly
4. ✅ Set up billing alerts
5. ✅ Keep backup of your key in secure storage
6. ✅ Never commit API keys to code repositories
7. ✅ Use different keys for development vs production
8. ✅ Review audit logs periodically

---

**Last Updated:** 2025-10-09  
**Security Version:** 2.0 (SHA-256 Hashing)
