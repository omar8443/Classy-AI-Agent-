# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

### Required Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Firestore Database** (Start in production mode)
4. Enable **Authentication** → Sign-in method → Email/Password
5. Get your web app config from Project Settings → General → Your apps
6. Get your service account key:
   - Project Settings → Service Accounts → Generate New Private Key
   - Encode to base64: `base64 -i path/to/serviceAccountKey.json`
   - Copy the base64 string to `FIREBASE_SERVICE_ACCOUNT_KEY`

### Optional Configuration

- **ELEVENLABS_WEBHOOK_SECRET**: For webhook signature verification
- **OPENAI_API_KEY**: For AI-powered call summarization

## 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 4. Create Your First User

1. Navigate to `/register`
2. Create an account with email/password
3. You'll be redirected to the dashboard

## 5. Test Webhook Endpoint

The webhook endpoint is available at:
```
POST /api/webhooks/elevenlabs-postcall
```

For local testing, use a tool like [ngrok](https://ngrok.com/) to expose your local server:
```bash
ngrok http 3000
```

Then configure ElevenLabs to send webhooks to your ngrok URL.

## 6. Deploy to Vercel

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy!

## Troubleshooting

### Firebase Admin SDK Errors
- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is base64-encoded JSON
- Check that the service account has Firestore permissions

### Authentication Issues
- Verify Firebase Auth is enabled in Firebase Console
- Check that email/password provider is enabled

### Webhook Not Working
- Verify the endpoint is accessible (check Vercel logs)
- Ensure payload matches the expected schema
- Check webhook secret if configured

