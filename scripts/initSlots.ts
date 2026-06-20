// scripts/initSlots.ts
import { initializeSlotsForVenue } from '@/lib/booking-service';

// Initialiser les créneaux pour une salle
async function initVenueSlots() {
  const venueId = 'VOTRE_VENUE_ID'; // À remplacer par l'ID de la salle
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3); // 3 mois à l'avance
  
  await initializeSlotsForVenue(venueId, startDate, endDate);
  console.log('Créneaux initialisés avec succès');
}

// Exécuter le script
initVenueSlots();