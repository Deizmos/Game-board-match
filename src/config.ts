export const JWT_SECRET = process.env["JWT_SECRET"] || 'your-secret-key-change-in-production';
export const JWT_REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"] || 'your-refresh-secret-key-change-in-production';
export const ACCESS_TOKEN_EXPIRES_IN = '15m';
export const REFRESH_TOKEN_EXPIRES_IN = '7d';


