declare global {
  interface Request {
    // Some server frameworks attach route params to the Request object (e.g. itty-router)
    // Add a permissive 'params' property to avoid TS errors across routes.
    params?: Record<string, string>;
  }
}

export {};
