export class SFX {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  private playSound(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 1, delayTime: number = 0.05, filterFrequency: number = 1500, detune: number = 0) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const delayNode = this.audioContext.createDelay();
    const filterNode = this.audioContext.createBiquadFilter();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.detune.setValueAtTime(detune, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(filterFrequency, this.audioContext.currentTime);

    delayNode.delayTime.setValueAtTime(delayTime, this.audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(filterNode);
    filterNode.connect(delayNode);
    delayNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public playShootSound() {
    this.playSound(800, 0.1, 'square', 1, 0.1, 800);
  }

  public playExplosionSound() {
    this.playSound(100, 0.5, 'sawtooth', 1, 0.3, 200);
  }

  public playJumpSound() {
    this.playSound(400, 0.2, 'triangle', 1, 0.1, 500);
  }

  public playCoinSound() {
    this.playSound(1200, 0.1, 'square', 1, 0.1, 1000);
  }

  public playCoinChipSound() {
    const baseFrequencies = [1500, 1200, 1800, 1000, 1500];
    const baseDelays = [0.1, 0.1, 0.1, 0.1, 0.1];
    const baseFilterFrequencies = [1200, 1000, 1400, 800, 1200];
    const baseDetunes = [0, 0, 0, 10, -10];

    baseFrequencies.forEach((freq, index) => {
      const randomFactor = (Math.random() - 0.5) * 0.2; // Random factor between -0.1 and 0.1
      const frequency = freq + freq * randomFactor;
      const delayTime = baseDelays[index] + (Math.random() - 0.5) * 0.05;
      const filterFrequency = baseFilterFrequencies[index] + baseFilterFrequencies[index] * randomFactor;
      const detune = baseDetunes[index] + (Math.random() - 0.5) * 20;

      setTimeout(() => {
        this.playSound(frequency, 0.1, 'square', 1, delayTime, filterFrequency, detune);
      }, index * 100);
    });
  }

  public playLevelUpSound() {
    this.playSound(500, 0.2, 'square', 1, 0.2, 700);
    setTimeout(() => this.playSound(1000, 0.2, 'square', 1, 0.2, 900), 200);
    setTimeout(() => this.playSound(1500, 0.2, 'square', 1, 0.2, 1100), 400);
  }

  public playPowerUpSound() {
    this.playSound(600, 0.2, 'triangle', 1, 0.2, 700);
    setTimeout(() => this.playSound(800, 0.2, 'triangle', 1, 0.2, 900), 200);
  }

  public playGameOverSound() {
    this.playSound(400, 0.3, 'sawtooth', 1, 0.3, 500);
    setTimeout(() => this.playSound(300, 0.3, 'sawtooth', 1, 0.3, 400), 300);
    setTimeout(() => this.playSound(200, 0.3, 'sawtooth', 1, 0.3, 300), 600);
  }

  public playMelody(melody: { frequency: number; duration: number; }[], tempo: number = 120) {
    let currentTime = this.audioContext.currentTime;
    const beatDuration = 60 / tempo; // duration of a beat in seconds

    melody.forEach(note => {
      this.playSound(note.frequency, note.duration * beatDuration, 'sine', 0.5, 0.05, 1200);
      currentTime += note.duration * beatDuration;
    });
  }

  public async playStream(url: string, volume: number = 1, loop: boolean = false) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = audioBuffer;
        source.loop = loop; // Enable looping if specified
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start(0);
    } catch (error) {
        console.error('Error loading audio stream:', error);
    }
}
}