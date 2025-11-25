/// <reference types="firebase-admin" />

declare namespace FirebaseFirestore {
  interface Timestamp {
    toDate(): Date
  }
}

