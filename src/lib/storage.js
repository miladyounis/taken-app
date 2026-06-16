import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

// Uploads a selfie to the couple's private folder and returns its storage path.
export async function uploadConfirmationSelfie(coupleId, uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  const path = `${coupleId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('confirmations')
    .upload(path, decode(base64), { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return path;
}

// A temporary viewable URL for a stored confirmation (private bucket).
export async function signedSelfieUrl(path, seconds = 60 * 60) {
  if (!path) return null;
  const { data } = await supabase.storage.from('confirmations').createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}
