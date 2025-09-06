# 🔧 Complete SMTP Configuration Guide

## Issue Detected
- Password reset emails: ✅ Working with Gmail SMTP
- Registration emails: ❌ Still using Supabase built-in (rate limited)

## Solution: Enable SMTP for ALL Email Types

### 1. Go to Supabase Dashboard
- Project: xmvdjtlyfazgudrmaojr
- Authentication → Email Templates

### 2. Configure Each Email Type
For EACH of these email types, ensure SMTP is enabled:

#### A. Confirm Signup (Most Important)
- Template: "Confirm signup"
- Make sure it uses your Gmail SMTP settings
- Subject: "Confirm your signup"

#### B. Invite User
- Template: "Invite user" 
- Enable SMTP

#### C. Magic Link
- Template: "Magic Link"
- Enable SMTP

#### D. Reset Password (Already Working)
- Template: "Reset Password"
- Already configured ✅

### 3. Verify SMTP Settings
Authentication → Settings → SMTP Settings should show:
```
✅ Enable custom SMTP: ON
✅ Host: smtp.gmail.com
✅ Port: 587
✅ Username: your-email@gmail.com
✅ Password: [16-char App Password]
✅ Sender name: Police Portal
✅ Sender email: your-email@gmail.com
```

### 4. Alternative: Disable Email Confirmation Temporarily
If SMTP continues to have issues:
- Authentication → Settings
- Toggle OFF: "Enable email confirmations"
- This allows immediate login without email verification

### 5. Test After Changes
- Wait 2-3 minutes for settings to propagate
- Use SMTP Debugger tool again
- Try registration with a new email

## Gmail App Password Setup (if needed)
1. Google Account → Security
2. Enable 2-Step Verification
3. App passwords → Generate new
4. Select "Mail" and "Other (custom name)"
5. Use the 16-character password in Supabase SMTP settings
