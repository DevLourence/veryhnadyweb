# 📧 Resend Production Setup Guide
## VeryHandy Solution - Email Configuration

---

## 🎯 Goal
Enable your application to send emails to **ANY user email address** (not just verified test emails).

---

## 📋 Current Status

### ❌ Problem
- **Resend is in Sandbox/Test Mode**
- Can only send emails to verified sender addresses
- New users signing up with `gmail.com`, `yahoo.com`, etc. **cannot receive OTP emails**
- This blocks user registration!

### ✅ Solution
**Verify your domain** with Resend to enable production email sending.

---

## 🚀 Step-by-Step Setup

### **Step 1: Log in to Resend Dashboard**

1. Go to: **https://resend.com/login**
2. Log in with your account (Google/GitHub or email/password)

---

### **Step 2: Navigate to Domains**

1. Once logged in, click on **"Domains"** in the left sidebar
2. Click **"Add Domain"** button

---

### **Step 3: Add Your Domain**

1. Enter your domain: `veryhandyhomeservice.com`
2. Click **"Add"**

---

### **Step 4: Verify Domain with DNS Records**

Resend will provide you with **DNS records** to add to your domain. You'll need to add these records to your domain registrar (where you bought your domain).

#### **DNS Records You'll Need to Add:**

Resend will give you records similar to these:

| Type | Name | Value | Priority |
|------|------|-------|----------|
| **TXT** | `@` or `veryhandyhomeservice.com` | `resend-verification=xxxxx` | - |
| **MX** | `@` or `veryhandyhomeservice.com` | `feedback-smtp.resend.com` | 10 |
| **TXT** | `@` or `veryhandyhomeservice.com` | `v=spf1 include:_spf.resend.com ~all` | - |
| **CNAME** | `resend._domainkey` | `resend._domainkey.resend.com` | - |

---

### **Step 5: Add DNS Records to Your Domain Registrar**

#### **Where to Add DNS Records:**

Go to your domain registrar's DNS management panel. Common registrars:

- **GoDaddy**: Domain Settings → DNS Management
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Cloudflare**: DNS → Records
- **Google Domains**: DNS → Custom records

#### **How to Add Each Record:**

1. **TXT Record (Verification)**
   - Type: `TXT`
   - Name/Host: `@` (or leave blank, or use your domain)
   - Value: Copy from Resend (e.g., `resend-verification=abc123...`)
   - TTL: `3600` (or Auto)

2. **MX Record (Mail Exchange)**
   - Type: `MX`
   - Name/Host: `@` (or leave blank)
   - Value: `feedback-smtp.resend.com`
   - Priority: `10`
   - TTL: `3600`

3. **TXT Record (SPF)**
   - Type: `TXT`
   - Name/Host: `@`
   - Value: `v=spf1 include:_spf.resend.com ~all`
   - TTL: `3600`

4. **CNAME Record (DKIM)**
   - Type: `CNAME`
   - Name/Host: `resend._domainkey`
   - Value: `resend._domainkey.resend.com`
   - TTL: `3600`

---

### **Step 6: Wait for DNS Propagation**

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes**
- You can check status in Resend dashboard

---

### **Step 7: Verify Domain in Resend**

1. Go back to Resend Dashboard → Domains
2. Click **"Verify"** next to your domain
3. If DNS records are correct, you'll see: ✅ **Verified**

---

### **Step 8: Update Email Sender Address**

Once your domain is verified, update the Edge Function to use your domain email:

**Current Code (in `send-booking-notification/index.ts`):**
```typescript
from: "VeryHandy <onboarding@resend.dev>", // Test Mode
```

**Update to:**
```typescript
from: "VeryHandy <noreply@veryhandyhomeservice.com>", // Production Mode
```

---

## 🎨 Recommended Email Addresses

After domain verification, you can use:

- `noreply@veryhandyhomeservice.com` - For automated emails (OTP, notifications)
- `support@veryhandyhomeservice.com` - For customer support
- `admin@veryhandyhomeservice.com` - For admin notifications
- `booking@veryhandyhomeservice.com` - For booking confirmations

---

## ✅ Testing After Setup

### **Test 1: Send to Any Email**

Once domain is verified, test with the email tester page:

1. Open: `test_email_transactions.html`
2. Enter **any email address** (e.g., `john@gmail.com`)
3. Click "Send Test" on OTP Verification
4. Email should be delivered successfully! ✅

### **Test 2: Real User Signup**

1. Go to your main website
2. Click "Sign Up"
3. Use a real email address (Gmail, Yahoo, etc.)
4. You should receive the OTP email!

---

## 🔧 Troubleshooting

### **Issue: Domain Not Verifying**

**Solution:**
- Double-check DNS records are **exactly** as shown in Resend
- Wait 30-60 minutes for DNS propagation
- Use DNS checker: https://dnschecker.org/
- Make sure there are no duplicate records

### **Issue: Emails Going to Spam**

**Solution:**
- Add **DMARC** record:
  ```
  Type: TXT
  Name: _dmarc
  Value: v=DMARC1; p=none; rua=mailto:admin@veryhandyhomeservice.com
  ```
- Ensure SPF and DKIM are properly configured
- Warm up your domain by sending gradually increasing volumes

### **Issue: Still Can't Send to Gmail/Yahoo**

**Solution:**
- Verify domain is fully verified in Resend (all green checkmarks)
- Check Resend dashboard for any errors
- Ensure you updated the `from` address in the Edge Function
- Redeploy the Edge Function after changes

---

## 📊 Resend Pricing (as of 2024)

- **Free Tier**: 3,000 emails/month
- **Pro Plan**: $20/month for 50,000 emails
- **Enterprise**: Custom pricing

For most small businesses, the **free tier is sufficient** to start!

---

## 🔐 Security Best Practices

1. **Never expose your Resend API Key** in frontend code
2. Keep API key in Supabase environment variables (already done ✅)
3. Use `noreply@` addresses for automated emails
4. Monitor email sending in Resend dashboard
5. Set up email rate limiting if needed

---

## 📝 Next Steps After Domain Verification

1. ✅ Update Edge Function sender address
2. ✅ Redeploy Edge Function
3. ✅ Test with real user emails
4. ✅ Monitor Resend dashboard for delivery rates
5. ✅ Set up email templates (optional, for better design)

---

## 🆘 Need Help?

- **Resend Documentation**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **DNS Help**: Contact your domain registrar support

---

## ✨ Once Complete

After domain verification, your application will be able to:

✅ Send OTP verification emails to **any user**  
✅ Send password reset emails to **any user**  
✅ Send booking notifications to **any client**  
✅ Send admin alerts for new bookings/reviews  
✅ Professional emails from `@veryhandyhomeservice.com`  

**Your email system will be production-ready!** 🚀

---

**Last Updated**: January 21, 2026  
**Status**: Awaiting Domain Verification
