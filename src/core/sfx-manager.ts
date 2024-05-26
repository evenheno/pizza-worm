export class SfxManager {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  public playSound(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 1,
    delayTime: number = 0.05,
    filterFrequency: number = 1500,
    detune: number = 0
  ) {
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

  public playResource(
    audioElement: HTMLAudioElement,
    options?: { volume?: number; repeat?: boolean }
  ) {
    if (!audioElement) {
      throw Error('Invalid audio element provided');
    }

    const track = this.audioContext.createMediaElementSource(audioElement);
    const gainNode = this.audioContext.createGain();

    if (options?.volume !== undefined) {
      gainNode.gain.setValueAtTime(options.volume, this.audioContext.currentTime);
    }

    track.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    if (options?.repeat) {
      audioElement.loop = true;
      audioElement.addEventListener('ended', function handler() {
        if (options?.repeat) {
          audioElement.loop = false;
          audioElement.removeEventListener('ended', handler);
        }
      });
    }

    audioElement.play().catch((error) => {
      throw `Error playing audio element: ${error}`;
    });
  }
}
