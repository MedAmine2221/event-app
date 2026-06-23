/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookingCalendar } from '@/components/admin/BookingCalendar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { colors } from '@/constants';
export default function VenuePage() {
  const params = useParams();
  const venueId = params.id as string;
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!venueId) return;
      const docRef = doc(db, 'venues', venueId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVenue({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchVenue();
  }, [venueId]);

  if (loading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  if (!venue) {
    return <div className="p-6 text-center">Salle non trouvée</div>;
  }

  return (
    <div className="p-6 max-w-350 mx-auto">
      <h1 className="text-3xl font-medium mb-6" style={{ color: colors.textDark }}>
        {venue.name}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-96 object-cover rounded-2xl"
          />
          <div className="mt-6">
            <h2 className="text-xl font-medium mb-4" style={{ color: colors.textDark }}>
              Informations
            </h2>
            <p className="text-sm" style={{ color: colors.textLight }}>
              {venue.description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs" style={{ color: colors.textLight }}>Capacité</span>
                <p className="font-medium">{venue.capacity}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: colors.textLight }}>Prix</span>
                <p className="font-medium" style={{ color: colors.primary }}>{venue.price}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: colors.textLight }}>Tables</span>
                <p className="font-medium">{venue.tables}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <BookingCalendar
            venueId={venueId}
            venueName={venue.name}
            colors={colors}
            onBookingSuccess={() => {
              // Optionnel: notification ou redirection
            }}
          />
        </div>
      </div>
    </div>
  );
}