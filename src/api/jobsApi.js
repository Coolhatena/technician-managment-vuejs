import supabase from '@/lib/supabaseClient'

export async function listJobs() {
  return await supabase.from('jobs')
    .select('id,title,status,customer_name,device_type,brand,model,updated_at')
    .order('updated_at', { ascending: false })
}

export async function getJob(id) {
  // Fetch job without nested embeds to avoid 400s if optional tables aren't present
  const jobRes = await supabase
    .from('jobs')
    .select('id,title,customer_name,customer_phone,device_type,brand,model,serial,intake_date,status,notes,assigned_to,share_public,public_token,created_at,updated_at')
    .eq('id', id)
    .single()

  if (jobRes.error) return jobRes

  // Fetch logs separately (keeps page working even if extra tables/relations are missing)
  const logsRes = await supabase
    .from('job_logs')
    .select('id,job_id,message,status,attachment_url,created_by,created_at')
    .eq('job_id', id)
    .order('created_at', { ascending: true })

  let logs = logsRes.data || []

  // Try to enrich with client responses (if table exists). Ignore if unavailable.
  try {
    if (logs.length > 0) {
      const ids = logs.map(l => l.id)
      const respRes = await supabase
        .from('job_extra_responses')
        .select('log_id,decision,created_at')
        .in('log_id', ids)
      if (!respRes.error && respRes.data) {
        const byLog = Object.create(null)
        for (const r of respRes.data) byLog[r.log_id] = { decision: r.decision, created_at: r.created_at }
        logs = logs.map(l => ({ ...l, extra_response: byLog[l.id] || null }))
      }
    }
  } catch (e) {
    // table might not exist yet; ignore
  }

  return {
    data: { ...(jobRes.data || {}), job_logs: logs },
    error: logsRes.error || null
  }
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

// Public response to an "Extra sugerido" log
export async function respondExtra(token, logId, decision) {
  return await supabase.rpc('respond_extra', { p_token: token, p_log_id: logId, p_decision: decision })
}
