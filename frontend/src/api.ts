import axios from 'axios'

export interface Filters {
  date_from?: string; date_to?: string;
  regions?: string[]; categories?: string[]; clinic_ids?: number[];
}

const getParams = (f: Filters) => ({
  date_from: f.date_from, date_to: f.date_to,
  regions: f.regions?.join(','), categories: f.categories?.join(','),
  clinic_ids: f.clinic_ids?.join(',')
})

export const fetchKPIs = (f: Filters) => axios.get('/api/dashboard/kpis', { params: getParams(f) }).then(r => r.data)
export const fetchTrends = (f: Filters) => axios.get('/api/dashboard/trends/monthly', { params: getParams(f) }).then(r => r.data)
export const fetchStructure = (f: Filters) => axios.get('/api/dashboard/structure/categories', { params: getParams(f) }).then(r => r.data)
export const fetchHeatmap = (f: Filters) => axios.get('/api/dashboard/activity/heatmap', { params: getParams(f) }).then(r => r.data)
export const fetchVariant11 = (f: Filters) => axios.get('/api/dashboard/variant11/avg_check', { params: getParams(f) }).then(r => r.data)
export const fetchDetails = (f: Filters) => axios.get('/api/dashboard/details', { params: getParams(f) }).then(r => r.data)