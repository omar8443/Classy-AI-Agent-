# Classy AI Assistant Dashboard

A production-ready web application for managing leads and call summaries from ElevenLabs post-call webhooks. Built with Next.js 14+, TypeScript, Firebase, and TailwindCSS.

## Features

- 📊 **Dashboard Overview** - View key metrics and recent calls
- 👥 **Lead Management** - Track and manage leads with search and filtering
- 📞 **Call History** - View detailed call transcripts and summaries
- 🔐 **Authentication** - Secure email/password authentication with Firebase
- 🎨 **Modern UI** - Apple-inspired minimal design with shadcn/ui components
- 🔔 **Webhook Integration** - Receive and process ElevenLabs post-call webhooks
- 🤖 **AI Summarization** - Optional OpenAI integration for call summaries

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Firestore enabled
- Firebase Admin SDK service account key
- (Optional) OpenAI API key for call summarization

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Classy-AI-Agent-
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Fill in your `.env.local` file with your Firebase credentials and optional API keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

FIREBASE_SERVICE_ACCOUNT_KEY=your_base64_encoded_service_account_json

ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret
OPENAI_API_KEY=your_openai_key  # Optional
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password provider)
4. Create a service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Encode the JSON file to base64: `base64 -i path/to/serviceAccountKey.json`
   - Add the base64 string to `FIREBASE_SERVICE_ACCOUNT_KEY`

## Webhook Configuration

Configure ElevenLabs to send post-call webhooks to:
```
https://your-domain.com/api/webhooks/elevenlabs-postcall
```

The webhook expects a payload with the following structure:
```json
{
  "call_id": "string",
  "timestamp": "string | number",
  "caller_phone_number": "string",
  "caller_name": "string | null",
  "transcript": "string | array",
  "audio_url": "string | null",
  "duration": "number"
}
```

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Auth components
│   ├── dashboard/       # Dashboard components
│   ├── leads/           # Lead-related components
│   └── calls/           # Call-related components
├── lib/
│   ├── firebaseClient.ts    # Firebase client SDK
│   ├── firebaseAdmin.ts     # Firebase admin SDK
│   ├── firestore/           # Firestore helpers
│   ├── hooks/               # React hooks
│   └── summarizeCall.ts     # OpenAI summarization
└── types/               # TypeScript types
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will automatically deploy on every push to the main branch.

## License

MIT

