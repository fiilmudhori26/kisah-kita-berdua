import {supabase} from './supabase';
export const PHOTO_BUCKET='couple-photos'; export const AUDIO_BUCKET='couple-audio';
export async function getCouple(){const {data,error}=await supabase.from('couple_members').select('couple_id,display_name,couples(id,name,invite_code)').single();if(error&&error.code!=='PGRST116')throw error;return data?.couples?{...data.couples,display_name:data.display_name}:null}
export async function signedMedia(bucket,path,expires=3600){if(!path)return null;const {data,error}=await supabase.storage.from(bucket).createSignedUrl(path,expires);if(error)throw error;return data.signedUrl}
export async function uploadPrivate(bucket,coupleId,file){const ext=file.name?.split('.').pop()?.toLowerCase()||'bin';const path=`${coupleId}/${crypto.randomUUID()}.${ext}`;const {error}=await supabase.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;return path}
