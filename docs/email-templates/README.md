# Lansa Auth Email Setup (Supabase + Resend)

## 1. Configure Custom SMTP in Supabase

Open **Supabase Dashboard → Authentication → Emails → SMTP Settings** and enable *Custom SMTP*:

| Field | Value |
|---|---|
| Sender email | `noreply@notification.lansa.online` |
| Sender name | `Lansa` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | *your Resend API key* (starts with `re_`) |
| Minimum interval | `1` second |

Save. Send yourself a test email from the same page to confirm delivery.

> Rate limits: increase **Auth → Rate Limits → "Emails per hour"** from the default `4` to `100`+ once SMTP is verified.

## 2. Paste the branded templates

Go to **Authentication → Emails → Templates** and, for each template, paste the matching HTML file from this folder into the *Message body* field. Keep the *Subject* lines below:

| Template | Subject | File |
|---|---|---|
| Confirm signup | `Welcome to Lansa — confirm your email` | `confirm-signup.html` |
| Magic Link | `Your Lansa sign-in link` | `magic-link.html` |
| Reset Password | `Reset your Lansa password` | `reset-password.html` |
| Change Email Address | `Confirm your new email on Lansa` | `change-email.html` |
| Invite user | `You've been invited to Lansa` | `invite.html` |
| Reauthentication | `Your Lansa verification code` | `reauthentication.html` |

Supabase auto-injects the `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}`, and `{{ .SiteURL }}` variables — no editing needed.

## 3. Test
Create a new account with a real email and confirm you receive the branded welcome email from `noreply@notification.lansa.online`.