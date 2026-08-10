import React from 'react';
import { View, StyleSheet } from 'react-native';
import ComplaintSubmissionScreen from './src/screens/ComplaintSubmissionScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <ComplaintSubmissionScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
