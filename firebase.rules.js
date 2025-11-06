rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Cada usuario sólo puede leer/escribir sus propios documentos
    match /users/{uid}/{collection=**}/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
