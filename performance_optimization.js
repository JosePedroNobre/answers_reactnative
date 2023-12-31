import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, Button } from 'react-native';
import axios from 'axios';

const API_URL = 'https://api.example.com/data';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}?page=${page}`);
      const newData = response.data;

      setData(prevData => [...prevData, ...newData]);
      setHasMore(newData.length > 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoadMore = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  const renderItem = ({ item }) => (
    <View>
      <Text>{item.title}</Text>
      {<Button title="Delete" onPress={() => handleDelete(item.id)} />}
    </View>
  );

  const keyExtractor = item => String(item.id);

  return (
    <View>
      {errorMessage ? (
        <Text style={{ color: 'red', margin: 10 }}>{errorMessage}</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem} 
          keyExtractor={keyExtractor} // used to extract unique keys from items in the FlatList
          onEndReached={handleLoadMore} // form of lazing loading for fetching additional data as the user scrolls through the list.
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => (loading ? <ActivityIndicator size="large" /> : null)}
        />
      )}
    </View>
  );
};

export default App;
