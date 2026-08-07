declare const process: {
  env: Record<string, string | undefined>;
};

export const env = {
  APP_ENV:
    process.env.EXPO_PUBLIC_APP_ENV ??
    (typeof __DEV__ !== 'undefined' && __DEV__ ? 'development' : 'production'),
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    (typeof __DEV__ !== 'undefined' && __DEV__
      ? 'https://api.staging.useclinsight.com'
      : 'https://api.useclinsight.com'),
} as const;

export const shouldPersistOnboarding = env.APP_ENV === 'production';
