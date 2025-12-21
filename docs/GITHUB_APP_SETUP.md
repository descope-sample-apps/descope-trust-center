# GitHub App Setup Guide

This guide walks you through creating a custom GitHub App for the autonomous OpenCode workflow.

## Step 1: Create the GitHub App

1. Go to your GitHub organization settings (or personal settings for personal repos):
   - Organization: `https://github.com/organizations/YOUR_ORG/settings/apps/new`
   - Personal: `https://github.com/settings/apps/new`

2. Fill in the basic information:
   - **GitHub App name**: `descope-trust-center-bot` (must be unique across GitHub)
   - **Homepage URL**: `https://github.com/YOUR_ORG/descope-trust-center`
   - **Webhook**: Uncheck "Active" (we don't need webhooks, Actions handle triggers)

## Step 2: Configure Permissions

Set the following **Repository permissions**:

| Permission | Access | Purpose |
|------------|--------|---------|
| **Contents** | Read and write | Create branches, commit code |
| **Issues** | Read and write | Read issues, post comments |
| **Pull requests** | Read and write | Create PRs, request reviews |
| **Workflows** | Read and write | Trigger repository_dispatch |
| **Metadata** | Read-only | Required (automatically set) |

Leave all other permissions as "No access".

## Step 3: Installation Settings

- **Where can this GitHub App be installed?**: "Only on this account"

## Step 4: Create the App

Click **Create GitHub App**.

## Step 5: Note Your App ID

After creation, you'll see the App settings page. Note the **App ID** (a number like `123456`).

## Step 6: Generate a Private Key

1. Scroll down to "Private keys"
2. Click **Generate a private key**
3. A `.pem` file will download - keep this safe!

## Step 7: Install the App

1. In the left sidebar, click **Install App**
2. Click **Install** next to your account/organization
3. Select "Only select repositories" and choose `descope-trust-center`
4. Click **Install**

## Step 8: Add Secrets to Repository

Go to your repository settings: `Settings > Secrets and variables > Actions`

Add these repository secrets:

| Secret Name | Value |
|-------------|-------|
| `APP_ID` | The App ID from Step 5 (e.g., `123456`) |
| `APP_PRIVATE_KEY` | The entire contents of the `.pem` file from Step 6 |

### How to add the private key:

1. Open the `.pem` file in a text editor
2. Copy the entire content including:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   ... (many lines of characters) ...
   -----END RSA PRIVATE KEY-----
   ```
3. Paste as the value for `APP_PRIVATE_KEY` secret

## Step 9: Verify Setup

Run this command locally to verify the app is installed:

```bash
gh api /repos/YOUR_ORG/descope-trust-center/installation --jq '.id'
```

If it returns an installation ID, you're all set!

## Troubleshooting

### "Resource not accessible by integration"
- Check that the app has the required permissions
- Ensure the app is installed on the repository
- Verify the private key is correctly formatted in secrets

### "Bad credentials"
- The private key may be incorrectly formatted
- Ensure you copied the entire `.pem` file content
- Check that APP_ID matches your app

### Token generation fails
- The `actions/create-github-app-token@v1` action requires both `APP_ID` and `APP_PRIVATE_KEY`
- Ensure no extra whitespace in the secrets

## Security Notes

- The private key is highly sensitive - never commit it to the repository
- Rotate the private key periodically (generate new, update secret, revoke old)
- The app token expires after 1 hour, which is fine for workflow runs
- Each workflow run generates a fresh token
