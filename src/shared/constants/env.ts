export const env = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.staging.clinical-tool.hng14.com',
} as const;
