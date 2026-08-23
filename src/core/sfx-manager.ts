import { Logger } from "./logger";
import { TPlaySfxOptions } from "./sfx-manager.type";

const logger = new Logger('SfxManager');

export type TPlayFreqOptions = {
  frequency: number,
  duration: number,
  volume?: number,
  type?: OscillatorType,
  delayTime?: number,
  filterFrequency?: number,
  detune?: number
}

export class SoundLib {
  private audioContext: AudioContext;
  private mediaSources = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
  private mediaGains = new WeakMap<HTMLAudioElement, GainNode>();

  constructor() {
    try {
      logger.log('Initializing.');
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      throw `Failed to initialize.`;
    }
  }

  private resumeAudioContext(): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch((error) => {
        logger.log('Failed to resume audio context.', error);
      });
    }
  }


  public playFreq(options: TPlayFreqOptions) {
    this.resumeAudioContext();
    const frequency = options.frequency;
    const duration = options.duration;
    const volume = options.volume !== undefined ? options.volume : 1;
    const type = options.type !== undefined ? options.type : 'sine';
    const delayTime = options.delayTime !== undefined ? options.delayTime : 0.05;
    const filterFrequency = options.filterFrequency !== undefined ? options.filterFrequency : 1500;
    const detune = options.detune !== undefined ? options.detune : 0;

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

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
      filterNode.disconnect();
      delayNode.disconnect();
    };

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public playSfx(audioElement: HTMLAudioElement, options?: TPlaySfxOptions) {
    this.resumeAudioContext();

    logger.log('Playing sfx.', options);
    if (!audioElement) throw Error('Invalid audio element provided');

    let track = this.mediaSources.get(audioElement);
    let gainNode = this.mediaGains.get(audioElement);
    if (!track) {
      track = this.audioContext.createMediaElementSource(audioElement);
      this.mediaSources.set(audioElement, track);
    }
    if (!gainNode) {
      gainNode = this.audioContext.createGain();
      track.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      this.mediaGains.set(audioElement, gainNode);
    }

    const targetVolume = options?.volume !== undefined ? options.volume : 1;
    gainNode.gain.setValueAtTime(targetVolume, this.audioContext.currentTime);

    audioElement.loop = !!options?.repeat;

    audioElement.play().catch((error) => {
      logger.log('Error playing audio element.', error);
    });

  }
}
