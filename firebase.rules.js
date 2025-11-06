// Reglas Firestore — Planta (aislamiento por uid)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // users/{uid}/[planta|interconsultas|completadas]/**
    match /users/{uid}/{collection=**}/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
