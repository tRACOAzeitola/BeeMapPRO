import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Apiary } from '../types/apiary';
import { fetchApiaries } from '../services/api';
import { SyncIndicator } from '../components/SyncIndicator';

export const ApiaryList = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  
  const { data: apiaries, isLoading, refetch } = useQuery<Apiary[]>({
    queryKey: ['apiaries'],
    queryFn: fetchApiaries,
  });

  const renderApiaryCard = ({ item: apiary }: { item: Apiary }) => {
    const totalHives = Object.values(apiary.hiveCounts).reduce((a, b) => a + b, 0);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ApiaryDetails', { id: apiary.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.apiaryName}>{apiary.name}</Text>
          <SyncIndicator
            lastSync={apiary.lastSync}
            isPending={apiary.pendingChanges}
          />
        </View>

        <View style={styles.hiveCounts}>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>Total</Text>
            <Text style={styles.countValue}>{totalHives}</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>🪨 Boas</Text>
            <Text style={styles.countValue}>{apiary.hiveCounts.good}</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>🪨🪨 Fortes</Text>
            <Text style={styles.countValue}>{apiary.hiveCounts.strong}</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>↖️🪨 Fracas</Text>
            <Text style={styles.countValue}>{apiary.hiveCounts.weak}</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>🥢 Mortas</Text>
            <Text style={styles.countValue}>{apiary.hiveCounts.dead}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={apiaries}
        renderItem={renderApiaryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  apiaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  hiveCounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  countItem: {
    width: '33%',
    marginBottom: 8,
  },
  countLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  countValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
}); 