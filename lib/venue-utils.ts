/* eslint-disable @typescript-eslint/no-explicit-any */
export const extractGuestCapacity = (capacity: string): number | null => {
  if (!capacity) return null;
  const match = capacity.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
};


export const isVenueAvailable = (venue: any, date: string, period: "morning" | "evening"): boolean => {
    if(!venue.unailableDates) return true;
    return !venue.unailableDates.some((u: any)=> {
        if(u.date !== date) return false;
        if(u.period === "full") return true;
        return u.period === period;
    })
}