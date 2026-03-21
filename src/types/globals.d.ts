declare global {
  interface Request {
    // Some frameworks or test helpers attach route params to the Request object.
    params?: Record<string, string>;
  }
}

export {};
