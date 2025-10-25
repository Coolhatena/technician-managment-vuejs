import supabase from '@/lib/supabaseClient'

export async function listJobs() {
  return await supabase.from('jobs')
    .select('id,title,status,customer_name,device_type,brand,model,updated_at')
    .order('updated_at', { ascending: false })
}

export async function getJob(id) {
  return await supabase.from('jobs')
    .select(`
      id,title,customer_name,customer_phone,device_type,brand,model,serial,intake_date,status,notes,assigned_to,share_public,public_token,created_at,updated_at,
      job_logs(id,job_id,message,status,attachment_url,created_by,created_at)
    `)
    .eq('id', id)
    .single()
}

export async function createJob(payload) {
  const user = (await supabase.auth.getUser()).data.user
  const toInsert = { ...payload, assigned_to: user.id }
  return await supabase.from('jobs').insert(toInsert).select().single()
}

export async function updateJob(id, patch) {
  return await supabase.from('jobs').update(patch).eq('id', id).select().single()
}

export async function addLog(jobId, message, status = null, attachmentUrl = null) {
  const user = (await supabase.auth.getUser()).data.user
  return await supabase.from('job_logs')
    .insert({ job_id: jobId, message, status, attachment_url: attachmentUrl, created_by: user.id })
    .select().single()
}

export async function getPublicTracking(token) {
  return await supabase.rpc('get_public_tracking', { p_token: token })
}

// Status lookup
export async function listStatuses() {
  return await supabase.from('jobs_status')
    .select('id, code, label')
    .order('id', { ascending: true })
}
