import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Switch, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { speechService } from '../utils/speech';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
  withDelay,
} from 'react-native-reanimated';

const MOCK_DARES = {
  couple: {
    regular: [
      "Take a cute selfie together",
      "Give your partner a 30-second massage",
      "Share your first impression of each other",
      "Do your best impression of each other",
      "Create a secret handshake together",
      "Feed each other a snack blindfolded",
      "Write down what you love most about each other",
      "Do a trust fall with your partner",
      "Make up a short love song for each other",
      "Draw each other's portrait in 60 seconds"
    ],
    romantic: [
      "Write a love note and read it out loud",
      "Slow dance to your favorite love song",
      "Share your most romantic memory together",
      "Give your partner three genuine compliments",
      "Recreate your first kiss",
      "Describe your perfect date with your partner",
      "Share your dreams for your future together",
      "Give each other a romantic nickname",
      "Share the moment you knew they were special",
      "Create a bucket list of adventures together"
    ]
  },
  friends: [
    "Speak like a robot for 2 minutes",
    "Tell your most embarrassing story",
    "Do your best dance move",
    "Impersonate a celebrity",
    "Make up a rap about someone in the room",
    "Do your best animal impression",
    "Tell a joke while holding water in your mouth",
    "Act out a scene from your favorite movie",
    "Speak in an accent for the next round",
    "Create a commercial for a random object"
  ],
  party: [
    "Start a dance-off",
    "Play charades for 1 minute",
    "Make up a song about someone in the room",
    "Do your best party trick",
    "Lead everyone in a conga line",
    "Create a human pyramid",
    "Start a lip-sync battle",
    "Teach everyone a TikTok dance",
    "Play air guitar to an invisible song",
    "Create a group handshake with everyone"
  ],
  extreme: [
    "Eat a spoonful of hot sauce",
    "Hold a plank for 1 minute",
    "Do 10 push-ups",
    "Tell a scary story",
    "Do 20 jumping jacks",
    "Hold an ice cube until it melts",
    "Arm wrestle with another player",
    "Do a wall sit for 45 seconds",
    "Balance on one foot with eyes closed",
    "Do your best breakdance move"
  ],
  custom: [
    "Create your own dare",
    "Make up a challenge",
    "Invent a new game rule",
    "Design a dare for someone else",
    "Create a unique physical challenge",
    "Make up a mental challenge",
    "Invent a group activity",
    "Design a skill-based challenge",
    "Create a timed challenge",
    "Invent a team-building activity"
  ],
};

const TRUTH_QUESTIONS = {
  couple: [
    "What was your first thought when you met your partner?",
    "What's the most romantic thing your partner has done for you?",
    "What's one thing you want to improve in our relationship?",
    "What's your favorite memory with your partner?",
    "What made you fall in love with your partner?",
    "What's one thing you've never told your partner?",
    "What's the cutest habit of your partner?",
    "What's your dream date with your partner?",
    "What's the most thoughtful gift you've received from your partner?",
    "What's one thing you wish your partner knew about you?"
  ],
  friends: [
    "What's your most embarrassing childhood memory?",
    "What's the worst fashion choice you've ever made?",
    "What's the craziest thing you've done for a dare?",
    "What's your biggest irrational fear?",
    "What's the worst date you've ever been on?",
    "What's your guilty pleasure song?",
    "What's the most trouble you've ever been in?",
    "What's your most awkward social moment?",
    "What's the weirdest dream you've ever had?",
    "What's your most unusual talent?"
  ],
  party: [
    "What's the wildest party experience you've had?",
    "What's your go-to karaoke song?",
    "What's the most spontaneous thing you've ever done?",
    "What's your most memorable party mistake?",
    "What's your secret party trick?",
    "What's the craziest thing you've done for attention?",
    "What's your most embarrassing dance moment?",
    "What's the worst party outfit you've worn?",
    "What's your favorite party memory?",
    "What's your most regrettable party photo?"
  ],
  extreme: [
    "What's your biggest life regret?",
    "What's the scariest thing you've ever done?",
    "What's your deepest secret?",
    "What's the most dangerous situation you've been in?",
    "What's the most rebellious thing you've done?",
    "What's your biggest fear in life?",
    "What's the most difficult decision you've made?",
    "What's something you've never told anyone?",
    "What's your biggest mistake?",
    "What's your most controversial opinion?"
  ],
  custom: [
    "What's something you want to change about yourself?",
    "What's your biggest dream in life?",
    "What's something you're proud of but never share?",
    "What's your biggest insecurity?",
    "What's a secret talent you have?",
    "What's something you wish more people knew about you?",
    "What's your most cherished memory?",
    "What's something you regret not doing?",
    "What's your biggest accomplishment?",
    "What's something you've always wanted to try?"
  ]
};

const MODE_COLORS = {
  couple: ['#FF69B4', '#FF1493'],
  friends: ['#34c759', '#5856d6'],
  party: ['#5856d6', '#af52de'],
  extreme: ['#ff3b30', '#ff2d55'],
  custom: ['#007aff', '#5856d6'],
};

export default function GameScreen() {
  const { mode, players: playersJson, numPlayers } = useLocalSearchParams();
  const players = JSON.parse(playersJson || '[]');
  const [currentChallenge, setCurrentChallenge] = useState({ type: '', text: '' });
  const [completed, setCompleted] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRomanticMode, setIsRomanticMode] = useState(false);
  const [usedDares, setUsedDares] = useState<Set<string>>(new Set());
  const [usedTruths, setUsedTruths] = useState<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulseAnim = useSharedValue(1);
  const spinnerAnim = useSharedValue(0);
  const completedAnim = useSharedValue(0);
  const micPulse = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      micPulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      micPulse.value = withTiming(1);
    }
  }, [isListening]);

  useEffect(() => {
    if (isListening) {
      speechService.startListening((transcript) => {
        if (transcript.includes('next dare')) {
          spinWheel();
        } else if (transcript.includes('skip')) {
          handleSkip();
        }
      });
    } else {
      speechService.stopListening();
    }

    return () => {
      if (isListening) {
        speechService.stopListening();
      }
    };
  }, [isListening]);

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micPulse.value }],
  }));

  const getRandomDare = () => {
    let availableDares: string[];
    if (mode === 'couple') {
      availableDares = isRomanticMode ? MOCK_DARES.couple.romantic : MOCK_DARES.couple.regular;
    } else {
      availableDares = MOCK_DARES[mode as string] || MOCK_DARES.custom;
    }

    const unusedDares = availableDares.filter(dare => !usedDares.has(dare));
    
    if (unusedDares.length === 0) {
      setUsedDares(new Set());
      return availableDares[Math.floor(Math.random() * availableDares.length)];
    }

    const newDare = unusedDares[Math.floor(Math.random() * unusedDares.length)];
    setUsedDares(prev => new Set([...prev, newDare]));
    return newDare;
  };

  const getRandomTruth = () => {
    const truths = TRUTH_QUESTIONS[mode as string] || TRUTH_QUESTIONS.custom;
    const unusedTruths = truths.filter(truth => !usedTruths.has(truth));

    if (unusedTruths.length === 0) {
      setUsedTruths(new Set());
      return truths[Math.floor(Math.random() * truths.length)];
    }

    const newTruth = unusedTruths[Math.floor(Math.random() * unusedTruths.length)];
    setUsedTruths(prev => new Set([...prev, newTruth]));
    return newTruth;
  };

  const spinWheel = async () => {
    rotation.value = withSequence(
      withTiming(rotation.value + 2 * Math.PI * 3, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      withSpring(rotation.value + 2 * Math.PI * 4)
    );

    scale.value = withSequence(
      withSpring(1.2),
      withTiming(1, { duration: 500 })
    );

    spinnerAnim.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 0 })
    );

    const dare = getRandomDare();
    setCurrentChallenge({ type: 'dare', text: dare });
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
    
    try {
      await speechService.speak(`${players[currentPlayerIndex]}, your dare is: ${dare}`);
    } catch (error) {
      console.warn('Speech failed:', error);
    }
  };

  const handleComplete = () => {
    completedAnim.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(1000, withTiming(0))
    );
    setCompleted(prev => prev + 1);
    spinWheel();
  };

  const handleSkip = async () => {
    const truth = getRandomTruth();
    setCurrentChallenge({ type: 'truth', text: truth });
    
    try {
      await speechService.speak(
        `${players[currentPlayerIndex]}, since you skipped the dare, here's your truth question: ${truth}`
      );
    } catch (error) {
      console.warn('Speech failed:', error);
    }
  };

  const toggleVoiceCommands = () => {
    setIsListening(!isListening);
  };

  const handleBackPress = () => {
    if (Platform.OS === 'web') {
      window.history.back();
    } else {
      router.back();
    }
  };

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}rad` },
        { scale: scale.value },
      ],
    };
  });

  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(spinnerAnim.value, [0, 1], [0, 1]),
    transform: [
      { scale: interpolate(spinnerAnim.value, [0, 0.5, 1], [0.3, 1.2, 0.3]) },
      { rotate: `${spinnerAnim.value * 360}deg` },
    ],
  }));

  const completedStyle = useAnimatedStyle(() => ({
    opacity: completedAnim.value,
    transform: [
      { scale: interpolate(completedAnim.value, [0, 0.5, 1], [0.3, 1.2, 1]) },
    ],
  }));

  useEffect(() => {
    setUsedDares(new Set());
    setUsedTruths(new Set());
  }, [isRomanticMode]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={MODE_COLORS[mode as string] || MODE_COLORS.custom}
        style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBackPress} 
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <Animated.View style={[styles.completedBadge, completedStyle]}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.completedText}>+1</Text>
          </Animated.View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{mode} Mode</Text>
          <View style={styles.scoreContainer}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.score}>{completed}</Text>
          </View>
        </View>

        {mode === 'couple' && (
          <View style={styles.romanticModeContainer}>
            <Ionicons 
              name={isRomanticMode ? "heart" : "heart-outline"} 
              size={24} 
              color="#FF69B4" 
            />
            <Text style={styles.romanticModeText}>Romantic Mode</Text>
            <Switch
              value={isRomanticMode}
              onValueChange={setIsRomanticMode}
              trackColor={{ false: '#333', true: '#FF1493' }}
              thumbColor={isRomanticMode ? '#fff' : '#f4f3f4'}
            />
          </View>
        )}

        <Animated.View style={[styles.voiceCommandButton, micAnimatedStyle]}>
          <TouchableOpacity 
            onPress={toggleVoiceCommands}
            style={styles.voiceButton}>
            <Ionicons 
              name={isListening ? "mic" : "mic-outline"} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.voiceCommandText}>
              {isListening ? "Voice Commands Active" : "Enable Voice Commands"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.playerTurn}>
          <Ionicons name="person" size={24} color="#fff" />
          {" "}{players[currentPlayerIndex]}'s Turn
        </Text>

        <Animated.View style={[styles.wheel, animatedStyles]}>
          <TouchableOpacity onPress={spinWheel} style={styles.wheelButton}>
            <Text style={styles.wheelText}>Spin for{'\n'}Dare!</Text>
            <Animated.View style={[styles.spinner, spinnerStyle]}>
              <Ionicons name="refresh" size={32} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {currentChallenge.text ? (
          <View style={styles.challengeContainer}>
            <View style={[
              styles.challengeTextContainer,
              currentChallenge.type === 'truth' && styles.truthContainer
            ]}>
              <Text style={styles.challengeType}>
                {currentChallenge.type === 'dare' ? 
                  <Ionicons name="flame" size={24} color="#FF4500" /> :
                  <Ionicons name="bulb" size={24} color="#4169E1" />
                }
                {" "}{currentChallenge.type === 'dare' ? 'DARE' : 'TRUTH'}
              </Text>
              <Text style={styles.challengeText}>{currentChallenge.text}</Text>
            </View>
            <View style={styles.buttonContainer}>
              {currentChallenge.type === 'dare' && (
                <TouchableOpacity
                  style={[styles.button, styles.skipButton]}
                  onPress={handleSkip}>
                  <Ionicons name="swap-horizontal" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Skip to Truth</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.completeButton]}
                onPress={handleComplete}>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.buttonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.instruction}>
            <Ionicons name="arrow-up" size={24} color="#fff" />
            {" "}Tap the wheel to start!
          </Text>
        )}
      </LinearGradient>
    </ScrollView>
  );
}

const { width, height } = Dimensions.get('window');
const wheelSize = Math.min(width * 0.6, 300);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    minHeight: height,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  score: {
    fontSize: 18,
    color: '#fff',
  },
  romanticModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 15,
    marginBottom: 20,
  },
  romanticModeText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  voiceCommandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 15,
    marginBottom: 20,
  },
  voiceCommandText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  playerTurn: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  wheel: {
    width: wheelSize,
    height: wheelSize,
    borderRadius: wheelSize / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  wheelButton: {
    width: wheelSize * 0.8,
    height: wheelSize * 0.8,
    borderRadius: (wheelSize * 0.8) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  challengeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    width: '100%',
  },
  challengeTextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  truthContainer: {
    backgroundColor: 'rgba(0, 0, 255, 0.1)',
  },
  challengeType: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  challengeText: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 32,
  },
  instruction: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  completeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 15,
  },
  completedBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  spinner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});