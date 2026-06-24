import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach token ──────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vlm_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // #region agent log
    fetch('http://127.0.0.1:7843/ingest/d60f1b26-6f1e-4d04-84ac-b3c63304b669',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a14862'},body:JSON.stringify({sessionId:'a14862',location:'api-client.ts:request',message:'API request',data:{method:config.method,url:config.url,baseURL:config.baseURL,hasToken:!!token},timestamp:Date.now(),hypothesisId:'A-B'})}).catch(()=>{});
    // #endregion
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 ──────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // #region agent log
    fetch('http://127.0.0.1:7843/ingest/d60f1b26-6f1e-4d04-84ac-b3c63304b669',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a14862'},body:JSON.stringify({sessionId:'a14862',location:'api-client.ts:response',message:'API success',data:{status:response.status,url:response.config.url},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return response;
  },
  (error) => {
    // #region agent log
    fetch('http://127.0.0.1:7843/ingest/d60f1b26-6f1e-4d04-84ac-b3c63304b669',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a14862'},body:JSON.stringify({sessionId:'a14862',location:'api-client.ts:error',message:'API error',data:{status:error.response?.status,url:error.config?.url,msg:error.response?.data?.message||error.response?.data?.error||error.message},timestamp:Date.now(),hypothesisId:'A-C-D'})}).catch(()=>{});
    // #endregion
    if (error.response?.status === 401) {
      if (localStorage.getItem("dev_bypass_auth") === "true") {
        return Promise.reject(error);
      }
      localStorage.removeItem("vlm_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
