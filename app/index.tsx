import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useMode } from '@/hooks/useMode';

const LoadingScreen = () => {
  const mode = useMode();
  return (
    <View style={[styles.container, { backgroundColor: mode.background }]}>
      <ActivityIndicator size="large" color={mode.blueText}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;
