export type TPlaySfxOptions = { volume?: number; repeat?: boolean };

export type TPlayFreqOptions = {
    frequency: number,
    duration: number,
    volume?: number,
    type?: OscillatorType,
    delayTime?: number,
    filterFrequency?: number,
    detune?: number
  }