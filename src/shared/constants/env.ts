declare const process: {
  env: Record<string, string | undefined>;
};

export const env = {
  APP_ENV:
    process.env.EXPO_PUBLIC_APP_ENV ??
    (typeof __DEV__ !== 'undefined' && __DEV__ ? 'development' : 'production'),
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.staging.clinical-tool.hng14.com',
} as const;

export const shouldPersistOnboarding = env.APP_ENV === 'production';
