const BASE_URL = import.meta.env.DEV ? '/api/bgm' : 'https://api.bgm.tv'

export async function bgmFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`Bangumi API ${path} 请求失败:HTTP ${res.status}`)
  }
  return (await res.json()) as T
}
