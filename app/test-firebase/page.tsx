"use client"

export default function TestFirebasePage() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Configuration Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(config, null, 2)}
      </pre>
      <div className="mt-4">
        <p className="font-semibold">Status:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>API Key: {config.apiKey ? "✅ Set" : "❌ Missing"}</li>
          <li>Auth Domain: {config.authDomain ? "✅ Set" : "❌ Missing"}</li>
          <li>Project ID: {config.projectId ? "✅ Set" : "❌ Missing"}</li>
        </ul>
      </div>
    </div>
  )
}

