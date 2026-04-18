
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const api = {
    get: async (url) => {
        const res = await fetch(`${BASE_URL}${url}`)
        if (!res.ok) throw new Error('Request failed')
        return res.json()
    },

    post: async (url, data) => {
        const res = await fetch(`${BASE_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Request failed')
            return res.json()
    },

    put: async (url, data) => {
        const res = await fetch(`${BASE_URL}${url}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Request failed')
            return res.json()
    },

    delete: async (url) => {
        const res = await fetch(`${BASE_URL}${url}`, {
            method: 'DELETE',
        })
        if (!res.ok) throw new Error('Request failed')
            return res.json()
    }
}