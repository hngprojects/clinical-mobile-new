export function backButtonLabel(screenTitle?: string): string {
  return screenTitle ? `Go back from ${screenTitle}` : 'Go back';
}

export function closeButtonLabel(context?: string): string {
  return context ? `Close ${context}` : 'Close';
}

export function loadingLabel(action?: string): string {
  return action ? `Loading, ${action}` : 'Loading';
}

export function dismissSheetLabel(): string {
  return 'Dismiss sheet';
}
