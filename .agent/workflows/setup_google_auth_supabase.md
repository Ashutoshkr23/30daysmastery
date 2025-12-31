---
description: How to configure Google OAuth for Supabase
---

# Setup Google OAuth for Supabase

Follow these steps to enable "Continue with Google" for your application.

## Part 1: Google Cloud Console

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create a New Project** (e.g., "30-days-mastery").
3.  **Configure OAuth Consent Screen**:
    *   Go to **APIs & Services > OAuth consent screen**.
    *   Select **External** and click **Create**.
    *   Fill in:
        *   **App Name**: `30 Days Mastery`
        *   **User Support Email**: Your email.
        *   **Developer Contact Email**: Your email.
    *   Click **Save and Continue** (skip Scopes and Test Users for now).
4.  **Create Credentials**:
    *   Go to **APIs & Services > Credentials**.
    *   Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
    *   **Application Type**: `Web application`.
    *   **Name**: `Supabase Auth`.
    *   **Authorized Redirect URIs**:
        *   You need your Supabase Project URL for this.
        *   Format: `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
        *   *(If you haven't created a Supabase project yet, do Part 2 Steps 1-2 first, getting the URL, then come back here)*.
    *   Click **Create**.
5.  **Copy Keys**:
    *   Copy the **Client ID**.
    *   Copy the **Client Secret**.

## Part 2: Supabase Dashboard

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Get Project URL**:
    *   Go to **Settings** (Gear Icon) > **API**.
    *   Copy the **Project URL** and **anon public key**.
    *   *(Use this URL to finish Part 1 Step 4 above)*.
3.  **Enable Google Auth**:
    *   Go to **Authentication** > **Providers**.
    *   Select **Google**.
    *   **Enable** "Google" (toggle on).
    *   Paste the **Client ID** from Google Cloud.
    *   Paste the **Client Secret** from Google Cloud.
    *   Click **Save**.

## Part 3: Share Keys

Once done, please provide the following so I can configure the app:

1.  `NEXT_PUBLIC_SUPABASE_URL`
2.  `NEXT_PUBLIC_SUPABASE_ANON_KEY`
