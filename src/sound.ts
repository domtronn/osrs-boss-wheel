// Generate sound effects using Web Audio API

export function generateSpinSound(durationSeconds: number = 4): string {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, durationSeconds * sampleRate, sampleRate);
  const data = buffer.getChannelData(0);

  // Calculate decay rates based on duration
  const freqDecay = 0.5 / (durationSeconds / 4);
  const envDecay = 0.8 / (durationSeconds / 4);

  // Generate a whooshing/spinning sound
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    // Decreasing frequency over time to simulate spinning down
    const frequency = 200 + 300 * Math.exp(-t * freqDecay);
    // Add some noise
    const noise = (Math.random() - 0.5) * 0.3;
    // Create a spinning whoosh sound
    const sine = Math.sin(2 * Math.PI * frequency * t);
    // Envelope to fade out
    const envelope = Math.exp(-t * envDecay);
    data[i] = (sine * 0.3 + noise * 0.7) * envelope;
  }

  return bufferToWav(buffer);
}

export function generateClickSound(): string {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const duration = 0.05; // Very short click
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate a sharp click/tick sound
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    // Quick percussive hit
    const frequency = 800;
    const tone = Math.sin(2 * Math.PI * frequency * t);
    // Very fast decay for click effect
    const envelope = Math.exp(-t * 100);
    data[i] = tone * envelope * 0.3;
  }

  return bufferToWav(buffer);
}

export function generateWinSound(): string {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const duration = 1;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate a cheerful "ding" sound
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate;
    // Multiple harmonics for a bell-like sound
    const freq1 = 800;
    const freq2 = 1000;
    const freq3 = 1200;

    const tone =
      Math.sin(2 * Math.PI * freq1 * t) * 0.5 +
      Math.sin(2 * Math.PI * freq2 * t) * 0.3 +
      Math.sin(2 * Math.PI * freq3 * t) * 0.2;

    // Quick decay envelope
    const envelope = Math.exp(-t * 5);
    data[i] = tone * envelope * 0.5;
  }

  return bufferToWav(buffer);
}

function bufferToWav(buffer: AudioBuffer): string {
  const length = buffer.length * buffer.numberOfChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setString = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(pos + i, str.charCodeAt(i));
    }
    pos += str.length;
  };

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };

  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setString('RIFF');
  setUint32(36 + length);
  setString('WAVE');
  setString('fmt ');
  setUint32(16);
  setUint16(1);
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * buffer.numberOfChannels * 2);
  setUint16(buffer.numberOfChannels * 2);
  setUint16(16);
  setString('data');
  setUint32(length);

  // Write audio data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < view.byteLength) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const sample = Math.max(-1, Math.min(1, channels[i][offset]));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      pos += 2;
    }
    offset++;
  }

  const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export function playSound(url: string) {
  const audio = new Audio(url);
  audio.volume = 0.3;
  audio.play().catch(err => console.warn('Audio play failed:', err));

  // Clean up blob URL after playing
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(url);
  });
}
