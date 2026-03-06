/**
 * Generic API client for calling Next.js API routes
 * Simplifies fetch calls with error handling
 */

export async function apiCall(endpoint, options = {}) {
  const { method = 'GET', body = null, ...fetchOptions } = options

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(endpoint, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error)
    throw error
  }
}

// Convenience methods
export function apiGet(endpoint) {
  return apiCall(endpoint, { method: 'GET' })
}

export function apiPost(endpoint, body) {
  return apiCall(endpoint, { method: 'POST', body })
}

export function apiPut(endpoint, body) {
  return apiCall(endpoint, { method: 'PUT', body })
}

export function apiPatch(endpoint, body) {
  return apiCall(endpoint, { method: 'PATCH', body })
}

export function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' })
}
