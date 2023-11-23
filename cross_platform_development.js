import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Platform, StatusBar, StyleSheet, Button } from 'react-native';

const CrossPlatformApp = () => {
  // Sample data for the FlatList
  const data = [
    { id: '1', text: 'Item 1' },
    { id: '2', text: 'Item 2' },
    { id: '3', text: 'Item 3' },
  ];

  const androidStyles = {
    button: {
      backgroundColor: '#4CAF50',
      borderRadius: 5,
      padding: 10,
    },
  };

  const iosStyles = {
    button: {
      backgroundColor: '#007AFF',
      borderRadius: 10,
      padding: 15,
    },
  };

  // Im using the latform-specific styles based on the platform
  const styles = Platform.OS === 'ios' ? iosStyles : androidStyles;

  // Custom loading indicator based on the platform
  const LoadingIndicator = () => (
    <ActivityIndicator
      size={Platform.OS === 'ios' ? 'large' : 'small'}
      color={Platform.OS === 'ios' ? '#007AFF' : '#4CAF50'}
    />
  );

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        // Customize scroll behavior for iOS
        bounces={Platform.OS === 'ios'}
        // Customize over-scroll mode for Android
        overScrollMode={Platform.OS === 'android' ? 'always' : 'auto'}
        // Custom loading indicator
        ListFooterComponent={LoadingIndicator}
      />

      <Button
        title="Press Me"
        onPress={() => console.log('Button Pressed')}
        style={styles.button} // Apply platform-specific button style
      />
    </View>
  );
};

export default CrossPlatformApp;
