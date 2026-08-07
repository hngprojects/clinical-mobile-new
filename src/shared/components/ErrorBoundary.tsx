import React, { Component, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <View style={styles.container} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
