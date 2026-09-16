const configuredApiUrl = (import.meta.env.VITE_API_URL || 'https://crisismap-exmc.onrender.com/api').trim();

// Accept either the Render root URL or its /api URL so Vercel environment
// variables cannot accidentally produce requests such as /incidents instead of /api/incidents.
const API_BASE = configuredApiUrl.replace(/\/$/, '').endsWith('/api')
  ? configuredApiUrl.replace(/\/$/, '')
  : `${configuredApiUrl.replace(/\/$/, '')}/api`;

async function request(path, options = {}) {
  const token = localStorage.getItem('crisismap_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  getIncidents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== 'All States') query.set(key, value);
    });
    return request(`/incidents${query.toString() ? `?${query}` : ''}`);
  },
  getIncident: (id) => request(`/incidents/${id}`),
  createIncident: (payload) => request('/incidents', { method: 'POST', body: JSON.stringify(payload) }),
  updateIncidentStatus: (id, status) => request(`/incidents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getServices: (type) => request(`/services${type ? `?type=${encodeURIComponent(type)}` : ''}`),
  getResponders: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value && query.set(key, value));
    return request(`/responders${query.toString() ? `?${query}` : ''}`);
  },
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
};

export const apiBase = API_BASE;
