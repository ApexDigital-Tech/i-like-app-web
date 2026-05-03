import admin from 'firebase-admin';

// Initialize with Application Default Credentials or local config
// If running locally, you might need: export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
admin.initializeApp({
  projectId: 'i-like-inmobiliaria'
});

const db = admin.firestore();

const COLLECTIONS = [
  'properties',
  'requests',
  'appointments',
  'users',
  'notifications'
];

async function migrate() {
  console.log('🚀 Starting Admin Data Migration for Multi-Tenancy...');
  
  for (const collectionName of COLLECTIONS) {
    console.log(`\n📦 Migrating collection: ${collectionName}`);
    
    try {
      const colRef = db.collection(collectionName);
      const snapshot = await colRef.get();
      
      let count = 0;
      const batch = db.batch();
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!data.organizationId) {
          batch.update(doc.ref, {
            organizationId: 'default-org',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          count++;
        }
      });
      
      if (count > 0) {
        await batch.commit();
        console.log(`✅ Finished ${collectionName}: ${count} documents updated.`);
      } else {
        console.log(`ℹ️ No documents needed update in ${collectionName}.`);
      }
    } catch (error) {
      console.error(`❌ Error migrating ${collectionName}:`, error);
    }
  }
  
  console.log('\n✨ Admin Migration Complete!');
  process.exit(0);
}

migrate();
