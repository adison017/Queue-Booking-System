export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '')
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '')
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '')
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  },
  
  apiRequest: (method: string, path: string, status?: number) => {
    const statusText = status ? ` - ${status}` : ''
    console.log(`[API] ${method} ${path}${statusText}`)
  },
  
  apiError: (method: string, path: string, error: any) => {
    console.error(`[API ERROR] ${method} ${path}`, error.message || error)
  },
}
