// Fancy audio jingles using Web Audio API
const createAudioContext = () => {
    try {
        return new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported');
        return null;
    }
};

// Unlock audio context on first user gesture
export const unlockAudioContext = () => {
    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        ctx.resume && ctx.resume();
        ctx.close();
    } catch (e) { }
};

const playNote = (ctx: AudioContext, frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
};

const playChord = (ctx: AudioContext, frequencies: number[], duration: number = 0.3) => {
    frequencies.forEach(freq => playNote(ctx, freq, duration, 'triangle', 0.15));
};

const playArpeggio = (ctx: AudioContext, frequencies: number[], noteDuration: number = 0.15) => {
    frequencies.forEach((freq, index) => {
        setTimeout(() => playNote(ctx, freq, noteDuration, 'sine', 1.2), index * noteDuration * 1000);
    });
};

export const playBeepBlue = () => {
    const ctx = createAudioContext();
    if (!ctx) return;

    // Blue whale sound - deep, mysterious with arpeggio
    playNote(ctx, 80, 0.3, 'sawtooth', 0.4);
    setTimeout(() => playArpeggio(ctx, [120, 160, 200], 0.15), 200);
    setTimeout(() => playNote(ctx, 100, 0.4, 'sine', 1.5), 800);
};

export const playBeepGreen = () => {
    const ctx = createAudioContext();
    if (!ctx) return;

    // Green success - ascending major scale
    playChord(ctx, [523, 659, 784], 0.4); // C major
    setTimeout(() => playChord(ctx, [659, 784, 988], 0.3), 200); // E major
    setTimeout(() => playNote(ctx, 1047, 0.5, 'sine', 0.2), 400); // High C
};

export const playBeepYellow = () => {
    const ctx = createAudioContext();
    if (!ctx) return;

    // Yellow warning - attention-grabbing with syncopation
    playNote(ctx, 440, 0.12, 'square', 0.3);
    setTimeout(() => playNote(ctx, 330, 0.12, 'square', 0.3), 120);
    setTimeout(() => playNote(ctx, 440, 0.12, 'square', 0.3), 240);
    setTimeout(() => playNote(ctx, 330, 0.12, 'square', 0.3), 360);
    setTimeout(() => playNote(ctx, 440, 0.2, 'square', 0.3), 480);
};

export const playBeepRed = () => {
    const ctx = createAudioContext();
    if (!ctx) return;

    // Red alert - dramatic with minor scale
    playNote(ctx, 200, 0.25, 'sawtooth', 0.35);
    setTimeout(() => playNote(ctx, 150, 0.25, 'sawtooth', 0.35), 250);
    setTimeout(() => playNote(ctx, 100, 0.35, 'sawtooth', 0.35), 500);
    setTimeout(() => playChord(ctx, [80, 120, 160], 0.5), 750);
    setTimeout(() => playNote(ctx, 60, 0.4, 'sine', 0.2), 1000);
}; 