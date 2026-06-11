import { supabase } from './supabase';
import { sendPush } from './push';

// The other person in your couple (or null if they haven't joined yet).
export async function getPartner(myId, coupleId) {
  if (!coupleId) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, expo_push_token')
    .eq('couple_id', coupleId)
    .neq('id', myId)
    .maybeSingle();
  return data ?? null;
}

// My couple's invite code, to share with my partner.
export async function getInviteCode(coupleId) {
  if (!coupleId) return null;
  const { data } = await supabase
    .from('couples')
    .select('invite_code')
    .eq('id', coupleId)
    .maybeSingle();
  return data?.invite_code ?? null;
}

// Send a nudge to your partner. Inserts the row (Realtime delivers it in-app);
// push delivery for a closed app is added later via an Edge Function.
export async function sendNudge({ coupleId, fromUser, toUser, toToken, fromName, message }) {
  const { data, error } = await supabase
    .from('nudges')
    .insert({ couple_id: coupleId, from_user: fromUser, to_user: toUser, message })
    .select()
    .single();
  if (error) throw error;

  // Fire the real push notification to the partner's device.
  await sendPush(toToken, fromName ? `${fromName} 💛` : 'taken?', message, { nudgeId: data.id });
  return data;
}

// Confirm a dose ("I took it") and send a little reply nudge back to your partner.
export async function confirmDose({ coupleId, userId, partnerId, partnerToken, myName, nudgeId, label }) {
  const { error } = await supabase.from('doses').insert({
    couple_id: coupleId,
    user_id: userId,
    nudge_id: nudgeId ?? null,
    label: label ?? null,
    confirm_type: 'swipe',
  });
  if (error) throw error;

  if (nudgeId) {
    await supabase.from('nudges').update({ opened_at: new Date().toISOString() }).eq('id', nudgeId);
  }

  // Reply nudge: care going back the other way.
  if (partnerId) {
    const replyMsg = 'took them 💕 thank you for looking out for me';
    await supabase.from('nudges').insert({
      couple_id: coupleId,
      from_user: userId,
      to_user: partnerId,
      message: replyMsg,
    });
    await sendPush(partnerToken, myName ? `${myName} took them ✓` : 'taken? ✓', replyMsg);
  }
}

// Nudges sent TO me that I haven't confirmed yet (no dose links to them, none opened).
export async function getPendingNudges(myId) {
  const { data } = await supabase
    .from('nudges')
    .select('*')
    .eq('to_user', myId)
    .is('opened_at', null)
    .order('created_at', { ascending: false });
  return data ?? [];
}
