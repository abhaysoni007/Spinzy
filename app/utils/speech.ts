import { Platform } from 'react-native';
import * as ExpoSpeech from 'expo-speech';

class SpeechService {
  private static instance: SpeechService;
  private synthesis: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isSpeechEnabled: boolean = true;
  private voiceGender: 'male' | 'female' = 'female';

  private constructor() {
    if (Platform.OS === 'web') {
      this.synthesis = window.speechSynthesis;
      if ('webkitSpeechRecognition' in window) {
        // @ts-ignore
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
      }
    }
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  public toggleSpeech(enabled: boolean) {
    this.isSpeechEnabled = enabled;
  }

  public setVoiceGender(gender: 'male' | 'female') {
    this.voiceGender = gender;
  }

  public async speak(text: string): Promise<void> {
    if (!this.isSpeechEnabled) return;

    try {
      if (Platform.OS === 'web') {
        if (this.synthesis) {
          this.synthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = this.voiceGender === 'female' ? 1.5 : 1.0;
          utterance.lang = 'en-US';

          // Get available voices
          const voices = this.synthesis.getVoices();
          const femaleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('samantha')
          );
          
          if (femaleVoice && this.voiceGender === 'female') {
            utterance.voice = femaleVoice;
          }
          
          this.synthesis.speak(utterance);
        }
      } else {
        await ExpoSpeech.speak(text, {
          language: 'en',
          pitch: this.voiceGender === 'female' ? 1.5 : 1.0,
          rate: 0.9,
        });
      }
    } catch (error) {
      console.warn('Speech synthesis failed:', error);
    }
  }

  public startListening(onResult: (text: string) => void): void {
    if (Platform.OS === 'web' && this.recognition) {
      this.recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        onResult(transcript.toLowerCase());
      };
      this.recognition.start();
    }
  }

  public stopListening(): void {
    if (Platform.OS === 'web' && this.recognition) {
      this.recognition.stop();
    }
  }

  public isSpeechEnabled(): boolean {
    return this.isSpeechEnabled;
  }
}

export const speechService = SpeechService.getInstance();