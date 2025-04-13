import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Apiary, HiveStatus } from '../types/apiary';
import { fetchApiary, updateHiveCounts } from '../services/api';
import { HiveCounter } from '../components/HiveCounter';
import { SyncIndicator } from '../components/SyncIndicator';
import { Map } from '../components/Map';

export const ApiaryDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { id } = route.params as { id: string };

  const { data: apiary, isLoading } = useQuery<Apiary>({
    queryKey: ['apiary', id],
    queryFn: () => fetchApiary(id),
  });

  const updateMutation = useMutation({
    mutationFn: updateHiveCounts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiary', id] });
    },
  });

  const handleCountChange = (status: HiveStatus, change: number) => {
    if (!apiary) return;

    const newCount = Math.max(0, apiary.hiveCounts[status] + change);
    const update = {
      id: apiary.id,
      hiveCounts: {
        ...apiary.hiveCounts,
        [status]: newCount,
      },
      timestamp: new Date().toISOString(),
    };

    updateMutation.mutate(update);
  };

  if (isLoading || !apiary) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{apiary.name}</Text>
        <SyncIndicator
          lastSync={apiary.lastSync}
          isPending={apiary.pendingChanges}
        />
      </View>

      <Map
        style={styles.map}
        location={apiary.location}
        zoomEnabled={true}
        showsUserLocation={true}
      />

      <View style={styles.counters}>
        <HiveCounter
          label="🪨 Boas"
          count={apiary.hiveCounts.good}
          onIncrement={() => handleCountChange(HiveStatus.GOOD, 1)}
          onDecrement={() => handleCountChange(HiveStatus.GOOD, -1)}
        />
        <HiveCounter
          label="🪨🪨 Fortes"
          count={apiary.hiveCounts.strong}
          onIncrement={() => handleCountChange(HiveStatus.STRONG, 1)}
          onDecrement={() => handleCountChange(HiveStatus.STRONG, -1)}
        />
        <HiveCounter
          label="↖️🪨 Fracas"
          count={apiary.hiveCounts.weak}
          onIncrement={() => handleCountChange(HiveStatus.WEAK, 1)}
          onDecrement={() => handleCountChange(HiveStatus.WEAK, -1)}
        />
        <HiveCounter
          label="🥢 Mortas"
          count={apiary.hiveCounts.dead}
          onIncrement={() => handleCountChange(HiveStatus.DEAD, 1)}
          onDecrement={() => handleCountChange(HiveStatus.DEAD, -1)}
        />
      </View>

      {apiary.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notas</Text>
          <Text style={styles.notesText}>{apiary.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  map: {
    height: 200,
    marginVertical: 16,
  },
  counters: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notes: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
}); 