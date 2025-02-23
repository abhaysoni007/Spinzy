import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withRepeat,
  withTiming,
  useSharedValue,
  Easing
} from 'react-native-reanimated';

const GAME_MODES = [
  {
    id: 'couple',
    title: 'Couple Mode',
    emoji: '❤️',
    gradient: ['#FF69B4', '#FF1493'], // Updated to more romantic pink shades
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop',
    minPlayers: 2,
    maxPlayers: 2,
  },
  {
    id: 'friends',
    title: 'Friends Mode',
    emoji: '🎉',
    gradient: ['#34c759', '#5856d6'],
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'party',
    title: 'Party Mode',
    emoji: '🥳',
    gradient: ['#5856d6', '#af52de'],
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop',
    minPlayers: 3,
    maxPlayers: 15,
  },
  {
    id: 'extreme',
    title: 'Extreme Mode',
    emoji: '⚠️',
    gradient: ['#ff3b30', '#ff2d55'],
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop',
    minPlayers: 2,
    maxPlayers: 6,
  },
  {
    id: 'custom',
    title: 'Custom Mode',
    emoji: '🎭',
    gradient: ['#007aff', '#5856d6'],
    image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=800&auto=format&fit=crop',
    minPlayers: 1,
    maxPlayers: 20,
  }
];

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function TabOneScreen() {
  const [selectedMode, setSelectedMode] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [numPlayers, setNumPlayers] = useState(2);
  const scale = useSharedValue(1);

  const handleModeSelect = (mode) => {
    setSelectedGameMode(mode);
    setShowPlayerModal(true);
  };

  const handleStartGame = () => {
    if (players.length >= selectedGameMode.minPlayers) {
      router.push({
        pathname: `/game/${selectedGameMode.id}`,
        params: {
          players: JSON.stringify(players),
          numPlayers: players.length
        }
      });
      setShowPlayerModal(false);
      setPlayers([]);
    }
  };

  const addPlayer = () => {
    if (players.length < selectedGameMode.maxPlayers) {
      setPlayers([...players, '']);
    }
  };

  const updatePlayerName = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const removePlayer = (index) => {
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Mode</Text>
      <Text style={styles.subtitle}>Select a game mode to start the challenge</Text>

      {GAME_MODES.map((mode) => (
        <TouchableOpacity
          key={mode.id}
          style={styles.modeCard}
          onPress={() => handleModeSelect(mode)}>
          <Image
            source={{ uri: mode.image }}
            style={StyleSheet.absoluteFillObject}
          />
          <BlurView intensity={80} style={StyleSheet.absoluteFillObject}>
            <AnimatedLinearGradient
              colors={mode.gradient}
              style={[styles.gradientOverlay, animatedStyle]}>
              <Text style={styles.modeEmoji}>{mode.emoji}</Text>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.playerCount}>
                  {mode.minPlayers === mode.maxPlayers 
                    ? `${mode.minPlayers} Players`
                    : `${mode.minPlayers}-${mode.maxPlayers} Players`}
                </Text>
              </View>
            </AnimatedLinearGradient>
          </BlurView>
        </TouchableOpacity>
      ))}

      <Modal
        visible={showPlayerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlayerModal(false)}>
        <View style={styles.modalContainer}>
          <BlurView intensity={90} style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedGameMode?.title} Setup
            </Text>
            <Text style={styles.modalSubtitle}>
              Add {selectedGameMode?.minPlayers === selectedGameMode?.maxPlayers 
                ? selectedGameMode?.minPlayers 
                : `${selectedGameMode?.minPlayers}-${selectedGameMode?.maxPlayers}`} players
            </Text>

            {players.map((player, index) => (
              <View key={index} style={styles.playerInputContainer}>
                <TextInput
                  style={styles.playerInput}
                  placeholder={`Player ${index + 1} name`}
                  placeholderTextColor="#666"
                  value={player}
                  onChangeText={(text) => updatePlayerName(index, text)}
                />
                <TouchableOpacity
                  style={styles.removePlayerButton}
                  onPress={() => removePlayer(index)}>
                  <Ionicons name="close-circle" size={24} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            ))}

            {players.length < selectedGameMode?.maxPlayers && (
              <TouchableOpacity
                style={styles.addPlayerButton}
                onPress={addPlayer}>
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addPlayerText}>Add Player</Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPlayerModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.startButton]}
                onPress={handleStartGame}
                disabled={players.length < selectedGameMode?.minPlayers}>
                <Text style={styles.modalButtonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>

      <View style={[styles.decorativeCircle, { backgroundColor: '#ff3b30' }]} />
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
  modeCard: {
    height: 100,
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
  },
  gradientOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  modeEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  playerCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  decorativeCircle: {
    height: 300,
    width: 300,
    borderRadius: 150,
    position: 'absolute',
    bottom: -150,
    left: '50%',
    marginLeft: -150,
    opacity: 0.1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  playerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  playerInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    marginRight: 10,
  },
  removePlayerButton: {
    padding: 5,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  addPlayerText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  startButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});