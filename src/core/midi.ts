export class MidiParser {
    private data: DataView;
    private position: number;
    private runningStatus: number | null;

    constructor(arrayBuffer: ArrayBuffer) {
        this.data = new DataView(arrayBuffer);
        this.position = 0;
        this.runningStatus = null;
        console.log(`MidiParser initialized with buffer length: ${this.data.byteLength}`);
        console.log(`Initial buffer content: ${new Uint8Array(arrayBuffer, 0, 4).toString()}`); // Check initial bytes
    }

    public parse(): { header: any, tracks: any[] } {
        console.log('Starting parse...');
        const header = this.parseHeader();
        if (header.headerChunkId !== 'MThd') {
            throw new Error(`Invalid MIDI header chunk ID: ${header.headerChunkId}`);
        }
        console.log('Header parsed:', header);
        const tracks = [];
        for (let i = 0; i < header.numTracks; i++) {
            console.log(`Parsing track ${i + 1} of ${header.numTracks}`);
            tracks.push(this.parseTrack());
        }
        console.log('Parsing complete.');
        return { header, tracks };
    }

    private parseHeader(): any {
        const headerChunkId = this.readString(4);
        const headerChunkSize = this.readInt32();
        const formatType = this.readInt16();
        const numTracks = this.readInt16();
        const timeDivision = this.readInt16();

        // Validate the parsed header values
        if (headerChunkSize !== 6) {
            throw new Error(`Invalid header chunk size: ${headerChunkSize}`);
        }
        if (formatType < 0 || formatType > 2) {
            throw new Error(`Invalid format type: ${formatType}`);
        }
        if (numTracks <= 0) {
            throw new Error(`Invalid number of tracks: ${numTracks}`);
        }
        if (timeDivision <= 0) {
            throw new Error(`Invalid time division: ${timeDivision}`);
        }

        return {
            headerChunkId,
            headerChunkSize,
            formatType,
            numTracks,
            timeDivision,
        };
    }

    private parseTrack(): any {
        const trackChunkId = this.readString(4);
        const trackChunkSize = this.readInt32();
        const trackEnd = this.position + trackChunkSize;

        if (trackEnd > this.data.byteLength) {
            console.error(`Error: Track size exceeds buffer length. Position: ${this.position}, Track end: ${trackEnd}, Buffer length: ${this.data.byteLength}`);
            throw new Error('Track size exceeds buffer length');
        }

        const events = [];
        while (this.position < trackEnd) {
            events.push(this.parseEvent());
        }

        return { trackChunkId, trackChunkSize, events };
    }

    private parseEvent(): any {
        const deltaTime = this.readVarInt();
        let eventTypeByte = this.readUint8();

        if ((eventTypeByte & 0x80) === 0) {
            eventTypeByte = this.runningStatus as number;
            this.position--;
        } else {
            this.runningStatus = eventTypeByte;
        }

        if (eventTypeByte === 0xff) {
            const metaType = this.readUint8();
            const length = this.readVarInt();
            const data = this.readBytes(length);
            return { deltaTime, type: "meta", metaType, data };
        } else if (eventTypeByte === 0xf0 || eventTypeByte === 0xf7) {
            const length = this.readVarInt();
            const data = this.readBytes(length);
            return { deltaTime, type: "sysEx", data };
        } else {
            const eventType = eventTypeByte >> 4;
            const channel = eventTypeByte & 0x0f;
            const param1 = this.readUint8();
            let param2;
            if (eventType !== 0xc && eventType !== 0xd) {
                param2 = this.readUint8();
            }
            return { deltaTime, type: "midi", eventType, channel, param1, param2 };
        }
    }

    private readString(length: number): string {
        let result = "";
        for (let i = 0; i < length; i++) {
            result += String.fromCharCode(this.readUint8());
        }
        console.log(`Read string: ${result}`);
        return result;
    }

    private readInt32(): number {
        this.checkPosition(4);
        const value = this.data.getInt32(this.position, false); // big-endian
        this.position += 4;
        console.log(`Read int32: ${value}, Position: ${this.position}`);
        return value;
    }

    private readInt16(): number {
        this.checkPosition(2);
        const value = this.data.getInt16(this.position, false); // big-endian
        this.position += 2;
        console.log(`Read int16: ${value}, Position: ${this.position}`);
        return value;
    }

    private readUint8(): number {
        this.checkPosition(1);
        const value = this.data.getUint8(this.position);
        this.position += 1;
        console.log(`Read uint8: ${value}, Position: ${this.position}`);
        return value;
    }

    private readVarInt(): number {
        let value = 0;
        let byte;
        let length = 0;
        do {
            byte = this.readUint8();
            value = (value << 7) | (byte & 0x7f);
            length += 1;
        } while (byte & 0x80);
        console.log(`Read varInt: ${value}, Position: ${this.position}`);
        return value;
    }

    private readBytes(length: number): Uint8Array {
        this.checkPosition(length);
        const bytes = new Uint8Array(this.data.buffer, this.position, length);
        this.position += length;
        console.log(`Read bytes: ${bytes}, Position: ${this.position}`);
        return bytes;
    }

    private checkPosition(length: number): void {
        if (this.position + length > this.data.byteLength) {
            console.error(`Attempt to read beyond buffer length. Position: ${this.position}, Length: ${length}, Buffer length: ${this.data.byteLength}`);
            throw new Error('Attempt to read beyond buffer length');
        }
    }

    public ticksPerSecond(): number {
        const timeDivision = this.data.getInt16(12, false); // big-endian
        if (timeDivision & 0x8000) {
            const framesPerSecond = 256 - (timeDivision >> 8);
            const ticksPerFrame = timeDivision & 0xff;
            return framesPerSecond * ticksPerFrame;
        } else {
            return timeDivision;
        }
    }
}

export type InstrumentConfig = {
    type: OscillatorType;
    gain: number;
};

export class MidiPlayer {
    private audioContext: AudioContext;
    private parser: MidiParser;
    private channelInstruments: InstrumentConfig[];
    private tempo: number;
    private activeNotes: Map<number, OscillatorNode>;

    constructor(arrayBuffer: ArrayBuffer) {
        this.audioContext = new AudioContext();
        this.parser = new MidiParser(arrayBuffer);
        this.channelInstruments = Array(16).fill({ type: 'sine', gain: 1 });
        this.tempo = 120;
        this.activeNotes = new Map<number, OscillatorNode>();
    }

    public async play(): Promise<void> {
        const midiData = this.parser.parse();
        const tracks = midiData.tracks;

        for (const track of tracks) {
            await this.playTrack(track);
        }
    }

    private async playTrack(track: any): Promise<void> {
        let currentTime = this.audioContext.currentTime;

        for (const event of track.events) {
            currentTime += (60 / this.tempo) * (event.deltaTime / this.parser.ticksPerSecond());

            if (event.type === "midi") {
                switch (event.eventType) {
                    case 8:
                        this.scheduleNoteOff(event.channel, event.param1, currentTime);
                        break;
                    case 9:
                        if (event.param2 > 0) {
                            this.scheduleNoteOn(event.channel, event.param1, event.param2, currentTime);
                        } else {
                            this.scheduleNoteOff(event.channel, event.param1, currentTime);
                        }
                        break;
                    case 12:
                        this.setInstrument(event.channel, event.param1);
                        break;
                }
            } else if (event.type === "meta" && event.metaType === 0x51) {
                this.tempo = 60000000 / ((event.data[0] << 16) | (event.data[1] << 8) | event.data[2]);
            }
        }
    }

    private setInstrument(channel: number, programNumber: number): void {
        const instrumentConfig = this.getInstrumentConfig(programNumber);
        this.channelInstruments[channel] = instrumentConfig;
    }

    private getInstrumentConfig(programNumber: number): InstrumentConfig {
        const instrumentMap: { [key: number]: InstrumentConfig } = {
            0: { type: 'sine', gain: 1 },
            1: { type: 'square', gain: 0.8 },
            2: { type: 'sawtooth', gain: 0.7 },
            3: { type: 'triangle', gain: 1 },
            // Add more mappings as needed
        };
        return instrumentMap[programNumber] || { type: 'sine', gain: 1 };
    }

    private scheduleNoteOn(channel: number, note: number, velocity: number, time: number): void {
        const frequency = this.midiNoteToFrequency(note);
        const gainNode = this.audioContext.createGain();
        const instrument = this.channelInstruments[channel];
        gainNode.gain.setValueAtTime((velocity / 127) * instrument.gain, time);

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = instrument.type;
        oscillator.frequency.setValueAtTime(frequency, time);

        oscillator.connect(gainNode).connect(this.audioContext.destination);
        oscillator.start(time);
        this.activeNotes.set(note, oscillator);
    }

    private scheduleNoteOff(channel: number, note: number, time: number): void {
        const oscillator = this.activeNotes.get(note);
        if (oscillator) {
            oscillator.stop(time);
            this.activeNotes.delete(note);
        }
    }

    private midiNoteToFrequency(note: number): number {
        return 440 * Math.pow(2, (note - 69) / 12);
    }
}
