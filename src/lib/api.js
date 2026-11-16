const api = async (path, options = {}) => {
  const response = await fetch(`/api${path.startsWith("/") ? path : `/${path}`}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || response.statusText || "Request failed");
  }
  return data;
};

export const apiGet = (path) => api(path);
export const apiPost = (path, body) => api(path, {
  method: "POST",
  body: JSON.stringify(body),
});
export const apiPatch = (path, body) => api(path, {
  method: "PATCH",
  body: JSON.stringify(body),
});
export const apiDelete = (path) => api(path, { method: "DELETE" });
