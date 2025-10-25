import supabase from '@/lib/supabaseClient'

export async function uploadAttachment(jobId, file) {
  const path = `${jobId}/${crypto.randomUUID()}-${file.name}` // convención: nombre único
  const { data, error } = await supabase.storage
    .from('job-attachments')
    .upload(path, file, { contentType: file.type || undefined, upsert: false })
  if (error) return { data, error }
  const { data: pub } = await supabase.storage.from('job-attachments').getPublicUrl(path)
  return { data: { path, publicUrl: pub.publicUrl }, error: null }
}
