import { View, Text, StyleSheet, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const MOCK_HISTORY = [
  {
    id: '1',
    mode: 'Party Mode',
    dare: 'Perform a dance-off with another player',
    date: '2024-02-20',
    completed: true,
  },
  {
    id: '2',
    mode: 'Couple Mode',
    dare: 'Whisper your biggest secret',
    date: '2024-02-19',
    completed: true,
  },
  {
    id: '3',
    mode: 'Extreme Mode',
    dare: 'Eat a spoonful of hot sauce',
    date: '2024-02-18',
    completed: false,
  },
  {
    id: '4',
    mode: 'Friends Mode',
    dare: 'Speak like a robot for 2 minutes',
    date: '2024-02-17',
    completed: true,
  },
  {
    id: '5',
    mode: 'Custom Mode',
    dare: 'Create your own challenge',
    date: '2024-02-16',
    completed: true,
  },
];

export default function HistoryScreen() {
  const renderItem = ({ item }) => (
    <BlurView intensity={80} style={styles.historyCard}>
      <LinearGradient
        colors={item.completed ? ['#34c759', '#32ade6'] : ['#ff3b30', '#ff9500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}>
        <View style={styles.cardContent}>
          <Text style={styles.modeText}>{item.mode}</Text>
          <Text style={styles.dareText}>{item.dare}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={[styles.statusText, { color: item.completed ? '#34c759' : '#ff3b30' }]}>
            {item.completed ? 'Completed' : 'Skipped'}
          </Text>
        </View>
      </LinearGradient>
    </BlurView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dare History</Text>
      <Text style={styles.subtitle}>Your past challenges and achievements</Text>

      <FlatList
        data={MOCK_HISTORY}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 60,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  listContainer: {
    paddingBottom: 20,
  },
  historyCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientBorder: {
    padding: 1,
    borderRadius: 20,
  },
  cardContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 19,
  },
  modeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  dareText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    top: 20,
    right: 20,
  },
});