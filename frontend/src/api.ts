/** Địa chỉ API: mặc định /api (Vite chuyển tiếp khi chạy máy); khi triển khai đặt VITE_API_BASE. */
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '/api';

const TOKEN_KEY = 'testflow.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Lỗi từ API, giữ mã HTTP và danh sách thông báo để hiển thị cho người dùng. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public messages: string[],
  ) {
    super(messages.join('\n'));
  }
}

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => (onUnauthorized = fn);

type Query = Record<string, string | number | boolean | undefined | null>;

/** Gọi REST API: tự gắn token, chuẩn hoá lỗi, hết phiên (401) thì đưa về trang đăng nhập. */
export async function api<T>(
  method: string,
  path: string,
  opts: { body?: unknown; query?: Query } = {},
): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  const token = tokenStore.get();
  const res = await fetch(`${API_BASE}${path}${qs.size ? `?${qs}` : ''}`, {
    method,
    headers: {
      ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    const msg = data?.message ?? `Lỗi ${res.status}`;
    throw new ApiError(res.status, Array.isArray(msg) ? msg : [msg]);
  }
  return data as T;
}

/** Tải file từ API có kèm token (thẻ <a href> thường không gửi được header Authorization). */
export async function download(path: string) {
  const token = tokenStore.get();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = data?.message ?? `Lỗi ${res.status}`;
    throw new ApiError(res.status, Array.isArray(msg) ? msg : [msg]);
  }
  const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'export.csv';
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
