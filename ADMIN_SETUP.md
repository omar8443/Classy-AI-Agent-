# Admin User Setup Guide

## 🎯 Overview

This guide explains how to set up your first admin user and manage user roles in the Classy AI Assistant Dashboard.

## 📋 What Changed

### New Features Added:
1. ✅ **Name field** added to user registration
2. ✅ **User documents** automatically created in Firestore during signup
3. ✅ **Call assignment system** - assign calls to specific agents
4. ✅ **Call tracking** - add notes and update status on calls
5. ✅ **User roles** - admin, agent, and viewer roles

### Updated Fields:

#### Users Collection
```javascript
{
  id: string,              // Auto-generated
  email: string,           // User's email
  name: string,            // Full name (NEW!)
  role: "admin" | "agent" | "viewer",  // User role
  createdAt: timestamp,
  updatedAt: timestamp,
  photoUrl: string | null,
  phoneNumber: string | null,
  isActive: boolean
}
```

#### Calls Collection (New Fields)
```javascript
{
  // ... existing fields ...
  assignedTo: string | null,        // User ID of assigned agent
  assignedToName: string | null,    // Name of assigned agent
  notes: string | null,             // Admin/agent notes
  status: "pending" | "in_progress" | "completed" | "follow_up" | null
}
```

## 🚀 Setup Instructions

### Step 1: Create Your First Admin User

#### Option A: Register a New Account (Recommended)
1. Go to your app's registration page: `/register`
2. Fill in:
   - **Full Name**: Your name
   - **Email**: Your admin email
   - **Password**: Strong password
3. Click "Sign up"
4. The system will automatically create your user document

#### Option B: Existing User
If you already have an account, skip to Step 2.

### Step 2: Set Admin Role in Firebase Console

1. **Open Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project

2. **Navigate to Firestore Database**
   - Click "Firestore Database" in left sidebar
   - Click on the "Data" tab

3. **Find the Users Collection**
   - You should see collections: `calls`, `leads`, `users`
   - Click on the `users` collection

4. **Locate Your User Document**
   - Find the document with your email
   - The document ID is your user ID (auto-generated)

5. **Update Role to Admin**
   - Click on your user document
   - Find the `role` field
   - Change the value from `"agent"` to `"admin"`
   - Click "Update"

### Step 3: Verify Admin Access

1. Sign out and sign back in
2. You should now have admin privileges

## 🔧 Manual User Creation (If Needed)

If the `users` collection doesn't exist yet:

1. **Create Collection**
   - Click "Start collection"
   - Collection ID: `users`

2. **Add Your Admin Document**
   - Document ID: Use your Firebase Auth UID (or auto-ID)
   - Add these fields:

```
email: "your-email@example.com"
name: "Your Full Name"
role: "admin"
createdAt: [Click "timestamp" → "Now"]
updatedAt: [Click "timestamp" → "Now"]
isActive: true
photoUrl: null
phoneNumber: null
```

3. Click "Save"

## 👥 Managing Users

### User Roles

- **Admin**: Full access, can assign calls, manage users
- **Agent**: Can be assigned calls, update call status and notes
- **Viewer**: Read-only access

### Assigning Calls to Agents

Admins can assign calls through the API:

```javascript
// Assign call to agent
POST /api/calls/{callId}/assign
{
  "userId": "agent-user-id",
  "status": "in_progress",
  "notes": "Following up with lead tomorrow"
}
```

### Tracking Call Progress

Each call now has:
- **assignedTo**: Which agent is handling it
- **assignedToName**: Agent's name (for easy display)
- **status**: pending → in_progress → completed/follow_up
- **notes**: Internal notes about the call

## 📊 What Admins Can See

As an admin, you can:
1. ✅ See all calls and leads
2. ✅ View which agent is assigned to each call
3. ✅ See call status and notes
4. ✅ Assign calls to team members
5. ✅ Track team performance

## 🔌 API Endpoints

### Get All Users
```bash
GET /api/users
```

### Assign Call
```bash
POST /api/calls/{callId}/assign
{
  "userId": "user-id-here",
  "notes": "Optional notes",
  "status": "in_progress"
}
```

### Create User Document
```bash
POST /api/users/create
{
  "userId": "firebase-auth-uid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "agent"
}
```

## 🎨 Next Steps

1. ✅ Set up your admin account
2. ✅ Invite team members to register
3. ✅ Set their roles in Firebase Console
4. ✅ Start assigning calls to agents
5. ✅ Track call outcomes with notes and status updates

## ⚠️ Important Notes

- **First user must be promoted manually** in Firebase Console
- **New users default to "agent" role** - admins need to update roles
- **User documents are created automatically** during registration
- **Existing users** won't have documents - they'll be created on next login

## 🐛 Troubleshooting

### "User not found" when assigning calls
- Make sure the user has logged in at least once after the update
- Check that the user document exists in Firestore

### Can't see users collection
- Make sure at least one user has registered
- The collection is created automatically on first user signup

### Role changes not taking effect
- Sign out and sign back in after role changes
- Clear browser cache if needed

## 🔒 Security

- Only admins should have Firebase Console access
- User roles are verified server-side
- All API endpoints should check user permissions (implement middleware)

---

**Need help?** Check the codebase or Firebase Console for more details.

