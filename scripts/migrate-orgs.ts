import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = [
  'properties',
  'requests',
  'appointments',
  'users',
  'notifications'
];

async function migrate() {
  console.log('🚀 Starting Data Migration for Multi-Tenancy...');
  
  for (const collectionName of COLLECTIONS) {
    console.log(`\n📦 Migrating collection: ${collectionName}`);
    
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      
      let count = 0;
      for (const document of snapshot.docs) {
        const data = document.data();
        
        if (!data.organizationId) {
          await updateDoc(doc(db, collectionName, document.id), {
            organizationId: 'default-org',
            updatedAt: new Date().toISOString()
          });
          count++;
        }
      }
      
      console.log(`✅ Finished ${collectionName}: ${count} documents updated.`);
    } catch (error) {
      console.error(`❌ Error migrating ${collectionName}:`, error);
    }
  }
  
  console.log('\n✨ Migration Complete!');
  process.exit(0);
}

migrate();
