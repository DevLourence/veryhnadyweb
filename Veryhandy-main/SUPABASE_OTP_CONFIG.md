# How to Force OTP Codes in Supabase Emails

You are currently receiving "Magic Links" instead of "OTP Codes". To fix this, you must adjust your Supabase Email Template settings, as the default setting often only sends a link.

### Steps to Fix

1.  **Log in** to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Go to **Authentication** (in the left sidebar) -> **Email Templates**.
3.  Select the **"Magic Link"** template (since we are using `signInWithOtp`).
4.  **Edit the Body** of the email.
    *   The standard template looks like: `<a href="{{ .ConfirmationURL }}">Log In</a>`
    *   **Change it to include the Code:**
        ```html
        <h2>Your Login Code</h2>
        <p>Please enter this code to log in:</p>
        <h1>{{ .Token }}</h1>
        <p>Or click here: <a href="{{ .ConfirmationURL }}">Log In</a></p>
        ```
    *   *Note: `{{ .Token }}` ensures the 6-digit code is visible.*
5.  **Save** the template.

### Why this is necessary
We are using the `signInWithOtp` method in your code, which is the correct "Standard" way. However, Supabase decides *how* to verify strictly based on the email template. By explicitly adding `{{ .Token }}` to the text, you ensure the user gets the code they need to type.
