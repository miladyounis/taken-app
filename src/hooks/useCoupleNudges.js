import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getPendingNudges } from '../lib/couple';

// Loads nudges sent to me and keeps them live via Supabase Realtime,
// so an incoming nudge appears instantly while the app is open.
export function useCoupleNudges(myId) {
  const [pending, setPending] = useState([]);

  const refresh = useCallback(async () => {
    if (!myId) return;
    setPending(await getPendingNudges(myId));
  }, [myId]);

  useEffect(() => {
    if (!myId) return;
    refresh();

    const channel = supabase
      .channel(`nudges-to-${myId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nudges', filter: `to_user=eq.${myId}` },
        () => refresh()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [myId, refresh]);

  return { pending, refresh };
}
