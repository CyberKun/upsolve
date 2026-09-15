export class ApiError extends Error {
  public status: number;
  public title: string;
  public detail: string;
  public type?: string;
  public errors?: { field: string; message: string }[];

  constructor(status: number, title: string, detail: string, type?: string, errors?: { field: string; message: string }[]) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.type = type;
    this.errors = errors;
  }
}

function getCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
  if (match?.[2]) return decodeURIComponent(match[2]);
  return null;
}

export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = `/api/v1${url}`;
  
  const headers = new Headers(options.headers);
  
  if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
    if (!getCsrfToken()) await fetchApi("/auth/csrf");
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set('X-XSRF-TOKEN', csrfToken);
    }
  }

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Connection failed', 'Cannot reach the Upsolve server. Check your connection and try again.');
  }

  if (response.status === 401) {
    // We could emit an event here for the AuthContext to handle
    window.dispatchEvent(new CustomEvent('auth-expired'));
  }

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = {
        title: response.statusText,
        detail: response.status >= 500
          ? 'The Upsolve server is unavailable. Please try again once the backend is running.'
          : 'The request failed. Please try again.',
      };
    }

    throw new ApiError(
      response.status,
      errorData.title || 'Error',
      errorData.detail || 'An unexpected error occurred.',
      errorData.type,
      errorData.errors
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(url: string, params?: Record<string, any>) => {
    let finalUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl += `?${queryString}`;
      }
    }
    return fetchApi<T>(finalUrl, { method: 'GET' });
  },
  
  post: <T>(url: string, body?: any) => {
    return fetchApi<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  
  put: <T>(url: string, body?: any) => {
    return fetchApi<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  
  patch: <T>(url: string, body?: any) => {
    return fetchApi<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  
  delete: <T = void>(url: string) => {
    return fetchApi<T>(url, { method: 'DELETE' });
  },
};
