# 📧 Supabase SMTP Quick Reference Card
## VeryHandy Email System - Keep This Handy!

---

## ⚡ 5-Minute Setup (Tier 1)

### **1. Enable Email Confirmations**
```
Supabase Dashboard → Authentication → Settings
Toggle ON: "Enable email confirmations"
```

### **2. Update Templates**
```
Authentication → Email Templates
Copy from: email-templates/supabase-confirm-signup.html
```

### **3. Configure URLs**
```
Authentication → URL Configuration
Site URL: https://veryhandyhomeservice.com
Add redirect URLs for dashboard pages
```

### **4. Test**
```
Sign up with your email → Check inbox → Click link → Done!
```

---

## 🔧 SMTP Settings Quick Reference

### **Supabase Default**
```yaml
Sender: noreply@mail.supabase.io
Limit: 3,000/month
Cost: FREE
Setup: Already done!
```

### **Gmail SMTP**
```yaml
Host: smtp.gmail.com
Port: 587
User: your-email@gmail.com
Password: [16-char app password]
TLS: ON
```

### **SendGrid SMTP**
```yaml
Host: smtp.sendgrid.net
Port: 587
User: apikey
Password: [SendGrid API Key]
TLS: ON
```

### **AWS SES**
```yaml
Host: email-smtp.us-east-1.amazonaws.com
Port: 587
User: [AWS SMTP Username]
Password: [AWS SMTP Password]
TLS: ON
```

---

## 📊 Email Limits

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Supabase | 3,000/mo | Included |
| Gmail | 500/day | N/A |
| SendGrid | 100/day | 50k/mo ($20) |
| AWS SES | 62k/mo | $0.10/1k |
| Resend | 3k/mo | 50k/mo ($20) |

---

## 🎨 Template Variables

```html
{{ .ConfirmationURL }}  <!-- Verification link -->
{{ .Token }}            <!-- OTP code -->
{{ .Email }}            <!-- User's email -->
{{ .SiteURL }}          <!-- Your website -->
{{ .TokenHash }}        <!-- Hashed token -->
```

---

## 🐛 Troubleshooting

### **Email not arriving?**
1. Check spam folder
2. Verify email confirmations enabled
3. Check Supabase logs
4. Ensure valid email address

### **Going to spam?**
1. Use custom SMTP
2. Verify domain
3. Add SPF/DKIM records

### **SMTP not working?**
1. Check credentials
2. Verify TLS enabled
3. Test connection online
4. Check provider docs

---

## 📁 File Locations

```
Documentation:
├── README_EMAIL_SYSTEM.md (Start here)
├── SUPABASE_SMTP_SUMMARY.md (Quick overview)
├── QUICK_SMTP_SETUP.md (Implementation)
├── SUPABASE_SMTP_MAXIMIZATION_GUIDE.md (Complete guide)
├── EMAIL_PROVIDER_COMPARISON.md (Comparison)
└── IMPLEMENTATION_CHECKLIST.md (Checklist)

Templates:
├── email-templates/
│   ├── supabase-confirm-signup.html
│   └── supabase-password-reset.html
```

---

## 🔗 Important Links

### **Supabase**
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs/guides/auth
- Project: `qakgewjfhemqgxxfcdvi`

### **Email Providers**
- Gmail App Passwords: https://myaccount.google.com/apppasswords
- SendGrid: https://app.sendgrid.com/
- AWS SES: https://console.aws.amazon.com/ses/

### **Tools**
- DNS Checker: https://dnschecker.org/
- SMTP Tester: https://www.smtper.net/
- Spam Checker: https://www.mail-tester.com/

---

## ✅ Quick Checklist

**Tier 1 (5 min):**
- [ ] Enable email confirmations
- [ ] Update templates
- [ ] Configure URLs
- [ ] Test signup

**Tier 2 (1 hour):**
- [ ] Choose provider (Gmail/SendGrid)
- [ ] Set up SMTP credentials
- [ ] Configure in Supabase
- [ ] Test deliverability

**Tier 3 (2 hours):**
- [ ] Complete Tier 2
- [ ] Update Edge Function
- [ ] Implement logging
- [ ] Set up monitoring

---

## 🎯 Success Criteria

✅ Emails arrive within 1 minute  
✅ Inbox placement (not spam)  
✅ Professional templates  
✅ All email types working  
✅ No errors in logs  

---

## 📞 Support

**Documentation:** See README_EMAIL_SYSTEM.md  
**Technical Issues:** Check Supabase logs  
**Email Issues:** Test with online tools  
**Help:** support@veryhandyhomeservice.com  

---

## 💡 Pro Tips

1. **Start with Tier 1** - Upgrade later
2. **Test thoroughly** - Multiple providers
3. **Monitor logs** - Catch issues early
4. **Customize templates** - Match your brand
5. **Plan for growth** - Know when to upgrade

---

## 🚀 Current Status

**Provider:** _______________  
**Tier:** _______________  
**Status:** _______________  
**Last Updated:** _______________  

---

**Version:** 1.0  
**Date:** January 21, 2026  
**Platform:** VeryHandy Home Services
