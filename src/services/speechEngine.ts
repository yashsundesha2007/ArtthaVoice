// Speech & Audio Architecture (Noise Resilience + Web Audio VAD + SpeechRecognition + SpeechSynthesis)

class SpeechAudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private recognition: any = null;
  private isListening = false;
  // Lowered threshold from 0.035 to 0.012 to easily catch softer voices without cutting words
  private vadThreshold = 0.012;
  private onVolumeChangeCallback: ((volume: number, isVoiceDetected: boolean) => void) | null = null;
  private animFrameId: number | null = null;
  private currentLanguage = 'hi-IN';

  constructor() {
    this.initSpeechRecognition();
  }

  // Initialize Web Speech API with fallback
  private initSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      // Continuous = true allows natural pauses without abruptly stopping
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
      this.recognition.lang = this.currentLanguage;
    }
  }

  // Switch recognition language: 'hi-IN', 'en-IN', 'gu-IN'
  public setLanguage(langCode: string) {
    this.currentLanguage = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  public getLanguage(): string {
    return this.currentLanguage;
  }

  // Initialize Web Audio with high-gain noise suppression and full vocal spectrum preservation
  public async initAudioPipeline(): Promise<boolean> {
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (!this.stream) {
        const constraints: MediaStreamConstraints = {
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000,
          },
          video: false,
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.6;

        this.microphone = this.audioContext.createMediaStreamSource(this.stream);

        // Highpass at 60Hz to eliminate sub-audio desk/floor rumble while keeping all vocal fundamentals (85Hz+)
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 60;

        // Mild vocal presence boost at 2500Hz
        const presence = this.audioContext.createBiquadFilter();
        presence.type = 'peaking';
        presence.frequency.value = 2500;
        presence.gain.value = 3;

        this.microphone.connect(highpass);
        highpass.connect(presence);
        presence.connect(this.analyser);
      }

      this.startVADLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access or Web Audio init failed/denied:', err);
      return false;
    }
  }

  // VAD Loop: measures vocal energy without clipping quiet consonants
  private startVADLoop() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkAudio = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length / 255; // 0 to 1

      const isVoiceDetected = avg > this.vadThreshold;

      if (this.onVolumeChangeCallback) {
        this.onVolumeChangeCallback(avg, isVoiceDetected);
      }

      this.animFrameId = requestAnimationFrame(checkAudio);
    };

    checkAudio();
  }

  public onVolumeChange(cb: (vol: number, isVoice: boolean) => void) {
    this.onVolumeChangeCallback = cb;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  // Start Voice Recognition with live interim feedback
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (this.isListening) return;

    this.playTone(440, 0.1, 'sine'); // Gentle cue chime

    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (!this.recognition) {
      onError({ error: 'speech_recognition_unavailable' });
      return;
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      const text = final || interim;
      if (text.trim()) {
        onResult(text.trim(), Boolean(final));
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      if (event.error !== 'no-speech') {
        this.isListening = false;
        onError(event);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.lang = this.currentLanguage;
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start caught error:', e);
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }
  }

  // Play pleasant acoustic tones using Web Audio
  public playTone(freq: number, duration: number, type: OscillatorType = 'sine') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = this.audioContext || new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio tone fallback silent
    }
  }

  public playSuccessChime() {
    this.playTone(523.25, 0.12, 'sine'); // C5
    setTimeout(() => {
      this.playTone(659.25, 0.25, 'sine'); // E5
    }, 120);
  }

  public playAlertChime() {
    this.playTone(440, 0.15, 'triangle');
    setTimeout(() => {
      this.playTone(349.23, 0.35, 'triangle');
    }, 160);
  }

  public speak(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(
      (v) =>
        v.lang === 'hi-IN' ||
        v.lang === 'en-IN' ||
        v.name.includes('India') ||
        v.name.includes('Hindi')
    );

    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.stopSpeaking();
  }
}

export const speechService = new SpeechAudioService();
