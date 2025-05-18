// index.tsx
// @module LoadingScreen

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useMode } from '@/hooks/useMode';

/**
 * LoadingScreen component
 * 
 * Displays a centered activity indicator while content is loading.
 * Syncs background color and spinner color with the current theme.
 *
 * @component
 * @returns {JSX.Element} A full-screen loading indicator.
 */
const LoadingScreen: React.FC = (): JSX.Element => {
  const mode = useMode();

  return (
    <View style={[styles.container, { backgroundColor: mode.background }]}>  
      <ActivityIndicator size="large" color={mode.blueText} />
    </View>
  );
};

/**
 * Styles for LoadingScreen component
 */
const styles = StyleSheet.create({
  /**
   * Container style to center the spinner vertically and horizontally.
   */
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;
