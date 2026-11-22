// Speech & Audio Architecture (Noise Resilience + Web Audio VAD + SpeechRecognition + SpeechSynthesis)

class SpeechAudioService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private recognition: any = null;
  private isListening = false;
  private vadThreshold = 0.035; // Energy threshold to cut out street/market rumble
  private onVolumeChangeCallback: ((volume: number, isVoiceDetected: boolean) => void) | null = null;
  private animFrameId: number | null = null;

  constructor() {
    this.initSpeechRecognition();
  }

  // Initialize Web Speech API with fallback
  private initSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
      // Default to Indian English / Hindi mix
      this.recognition.lang = 'hi-IN';
    }
  }

  // Set recognition language if needed (though our parser handles all multilingual inputs dynamically)
  public setLanguage(langCode: string) {
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  // Initialize Web Audio with aggressive noise suppression, echo cancellation & AGC
  public async initAudioPipeline(): Promise<boolean> {
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (!this.stream) {
        // High-res audio constraints specified in prompt
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
        this.analyser.smoothingTimeConstant = 0.8;

        this.microphone = this.audioContext.createMediaStreamSource(this.stream);

        // Optional BiquadFilter to cut low-frequency street rumble (< 100Hz) & extreme high whistles (> 7500Hz)
        const bandpass = this.audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1800;
        bandpass.Q.value = 0.6;

        this.microphone.connect(bandpass);
        bandpass.connect(this.analyser);
      }

      this.startVADLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access or Web Audio init failed/denied:', err);
      return false;
    }
  }

  // VAD Loop: continuously measures root mean square energy and checks against market noise floor
  private startVADLoop() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkAudio = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);

      // Calculate average RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length / 255; // 0 to 1

      // Threshold check: voice activity vs background rumble
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

  // Start Voice Recognition
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (this.isListening) return;

    this.playTone(440, 0.1, 'sine'); // Gentle cue chime

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
      onResult(text, Boolean(final));
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
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

  // Success chime (double tone)
  public playSuccessChime() {
    this.playTone(523.25, 0.12, 'sine'); // C5
    setTimeout(() => {
      this.playTone(659.25, 0.25, 'sine'); // E5
    }, 120);
  }

  // Alert chime (amber/red threshold)
  public playAlertChime() {
    this.playTone(440, 0.15, 'triangle');
    setTimeout(() => {
      this.playTone(349.23, 0.35, 'triangle');
    }, 160);
  }

  // High-contrast, crystal clear Text-to-Speech for Indian elders
  public speak(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Slower, clearer rate for elderly comprehension
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Pick best available Indian voice (Hindi, Indian English, or generic)
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
