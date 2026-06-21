// scripts/initAllSlots.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA6rMDDBhx3Pc4B05UBGk1CFBmeeU-_TD8",
  authDomain: "event-app-8186a.firebaseapp.com",
  projectId: "event-app-8186a",
  messagingSenderId: "767255399719",
  appId: "1:767255399719:web:d52140ba35fb12d317ed02"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initAllSlots() {
  console.log('🚀 Initialisation des créneaux...');
  
  try {
    // Récupérer toutes les salles
    const venuesSnapshot = await getDocs(collection(db, "venues"));
    const venues = [];
    venuesSnapshot.forEach((doc) => {
      venues.push({ id: doc.id, ...doc.data() });
    });
    
    if (venues.length === 0) {
      console.log('❌ Aucune salle trouvée');
      return;
    }
    
    console.log(`📋 ${venues.length} salle(s) trouvée(s)`);
    
    // Générer les dates sur 6 mois
    const dates = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    console.log(`📅 ${dates.length} dates générées`);
    
    const periods = ["morning", "evening"];
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const venue of venues) {
      console.log(`🏛️ Traitement de la salle: ${venue.name} (${venue.id})`);
      let venueCreated = 0;
      
      for (const date of dates) {
        for (const period of periods) {
          try {
            // Vérifier si le créneau existe déjà
            const existingQuery = query(
              collection(db, "timeSlots"),
              where("venueId", "==", venue.id),
              where("date", "==", date),
              where("period", "==", period)
            );
            const existing = await getDocs(existingQuery);
            
            if (existing.empty) {
              await addDoc(collection(db, "timeSlots"), {
                venueId: venue.id,
                date: date,
                period: period,
                isAvailable: true,
                createdAt: Timestamp.now(),
              });
              created++;
              venueCreated++;
              if (created % 10 === 0) {
                console.log(`  ✅ ${created} créneaux créés...`);
              }
            } else {
              skipped++;
            }
          } catch (error) {
            errors++;
            console.error(`  ❌ Erreur ${date} - ${period}:`, error.message);
          }
        }
      }
      console.log(`  ✅ ${venue.name}: ${venueCreated} créneaux créés`);
    }
    
    console.log(`\n🎉 Terminé!`);
    console.log(`📊 ${created} créneaux créés, ${skipped} déjà existants, ${errors} erreurs`);
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

// Exécuter la fonction
initAllSlots();