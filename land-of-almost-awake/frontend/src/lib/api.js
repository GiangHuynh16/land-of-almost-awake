const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body }),
  join: (body) => request('/auth/join', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getKingdoms: () => request('/kingdoms'),
  getPartnerKingdoms: () => request('/kingdoms/partner'),
  getPartner: () => request('/users/partner'),
  getAchievements: (kingdomId) =>
    request(`/achievements${kingdomId ? `?kingdom_id=${kingdomId}` : ''}`),
  createAchievement: (body) => request('/achievements', { method: 'POST', body }),
  completeAchievement: (id) => request(`/achievements/${id}/complete`, { method: 'PATCH' }),
  deleteAchievement: (id) => request(`/achievements/${id}`, { method: 'DELETE' }),
}
