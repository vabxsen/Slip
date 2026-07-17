let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  audioContext ??= new Ctor();
  return audioContext;
}

/** A single soft tone with a quick attack and gentle decay, so notes don't click. */
function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number): void {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.18, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function playChime(notes: Array<{ frequency: number; delay: number; duration: number }>): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    for (const note of notes) {
      playTone(ctx, note.frequency, now + note.delay, note.duration);
    }
  } catch {
    // Audio unavailable/blocked — fail silently, sound is a nice-to-have.
  }
}

/** Quick ascending chime — plays when a file finishes sending. */
export function playSentSound(): void {
  playChime([
    { frequency: 659.25, delay: 0, duration: 0.12 }, // E5
    { frequency: 880, delay: 0.08, duration: 0.18 }, // A5
  ]);
}

/** Quick descending chime — plays when a file finishes downloading. */
export function playReceivedSound(): void {
  playChime([
    { frequency: 880, delay: 0, duration: 0.1 }, // A5
    { frequency: 659.25, delay: 0.07, duration: 0.2 }, // E5
  ]);
}
