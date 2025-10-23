import supabase from '@/lib/supabaseClient'

export async function listJobs() {
  return await supabase.from('jobs')
    .select('id,title,status,customer_name,device_type,brand,model,updated_at')
    .order('updated_at', { ascending: false })
}

export async function getJob(id) {
  return await supabase.from('jobs')
    .select('*, job_logs(*, created_by)')
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

export async function addLog(jobId, message, status = null) {
  const user = (await supabase.auth.getUser()).data.user
  return await supabase.from('job_logs')
    .insert({ job_id: jobId, message, status, created_by: user.id })
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
