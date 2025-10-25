import { defineStore } from 'pinia'
import { listJobs, getJob, createJob, updateJob, addLog, listStatuses } from '@/api/jobsApi'

export const useJobsStore = defineStore('jobs', {
  state: () => ({
    items: [],
    current: null,
    loading: false,
    error: null,
    statuses: [],         // [{id, code, label}]
    statusesById: {}      // { [id]: {id, code, label} }
  }),
  actions: {
    async fetchStatuses() {
      if (this.statuses && this.statuses.length > 0) return
      const { data, error } = await listStatuses()
      if (error) { this.error = error; return }
      this.statuses = data || []
      this.statusesById = {}
      for (const s of this.statuses) this.statusesById[s.id] = s
    },
    async fetchAll() {
      this.loading = true
      await this.fetchStatuses()
      const { data, error } = await listJobs()
      this.loading = false
      if (error) { this.error = error; return }
      this.items = data || []
    },
    async fetchOne(id) {
      this.loading = true
      await this.fetchStatuses()
      const { data, error } = await getJob(id)
      this.loading = false
      if (error) { this.error = error; return }
      this.current = data
    },
    async create(payload) {
      const { data, error } = await createJob(payload)
      if (!error) this.items.unshift(data)
      return { data, error }
    },
    async patch(id, patch) {
      const { data, error } = await updateJob(id, patch)
      if (!error) {
        this.current = data
        const idx = this.items.findIndex(j => j.id === id)
        if (idx >= 0) this.items[idx] = data
      }
      return { data, error }
    },
    async appendLog(jobId, message, status = null, attachmentUrl = null) {
      const { data, error } = await addLog(jobId, message, status, attachmentUrl)
      if (!error && this.current && this.current.id === jobId) {
        this.current.job_logs = this.current.job_logs || []
        this.current.job_logs.push(data)
      }
      return { data, error }
    },
    // helpers
    statusLabel(id) {
      return (this.statusesById[id]?.label) || ''
    },
    statusCode(id) {
      return (this.statusesById[id]?.code) || ''
    }
  }
})
