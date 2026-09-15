// The five tunes from the Visiobal firmware (src/main.cpp in visiobal-hardware),
// copied verbatim: note frequency in Hz, duration in ms, and the harmony ratio
// the square-wave voice plays against the triangle-wave lead.
// Firmware constants the browser playback mirrors are exported alongside.

export const SYNTH = {
  leadVolume: 120, // LEAD_VOL
  harmonyVolume: 50, // HARM_VOL
  noteGapMs: 30, // NOTE_GAP_MS
  attackMs: 10, // envelope.setTimes(10, 50, …, 60)
  decayMs: 50,
  releaseMs: 60,
  attackLevel: 255, // envelope.setADLevels(255, 180)
  decayLevel: 180,
};

export const SONGS = [
  {
    id: "SONG1",
    melody: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 392.0, 329.63, 440.0, 293.66, 392.0, 523.25],
    durations: [250, 250, 500, 250, 250, 500, 250, 250, 375, 125, 250, 500],
    harmony: [2.0, 1.5, 2.0, 1.5, 2.0, 0.5, 1.5, 2.0, 1.5, 2.0, 1.5, 1.0],
  },
  {
    id: "SONG2",
    melody: [
      164.81, 196.0, 220.0, 196.0, 246.94, 220.0, 196.0, 164.81, 185.0, 220.0, 246.94, 233.08, 196.0, 164.81, 146.83,
      164.81,
    ],
    durations: [125, 125, 250, 125, 125, 250, 125, 250, 125, 125, 125, 125, 375, 125, 250, 125],
    harmony: [1.5, 1.5, 1.5, 2.0, 1.5, 2.0, 1.5, 1.5, 2.0, 1.5, 1.5, 1.5, 1.5, 2.0, 1.5, 1.0],
  },
  {
    id: "SONG3",
    melody: [392.0, 329.63, 293.66, 246.94, 220.0, 196.0, 220.0, 293.66, 329.63, 392.0],
    durations: [500, 500, 375, 500, 500, 750, 375, 500, 375, 750],
    harmony: [1.0, 1.5, 1.0, 1.5, 1.0, 1.0, 1.5, 1.0, 1.5, 1.0],
  },
  {
    id: "SONG4",
    melody: [164.81, 220.0, 261.63, 329.63, 261.63, 220.0, 164.81, 196.0, 246.94, 293.66, 349.23, 293.66, 220.0, 164.81],
    durations: [250, 250, 375, 500, 375, 250, 375, 250, 250, 375, 500, 375, 250, 500],
    harmony: [0.5, 1.0, 1.0, 1.5, 1.0, 0.5, 0.5, 1.0, 1.0, 1.5, 1.5, 1.0, 0.5, 0.5],
  },
  {
    id: "SONG5",
    melody: [
      220.0, 220.0, 293.66, 220.0, 369.99, 329.63, 293.66, 246.94, 220.0, 220.0, 261.63, 220.0, 196.0, 220.0, 246.94,
      293.66, 329.63, 220.0,
    ],
    durations: [125, 125, 250, 125, 125, 250, 125, 125, 125, 125, 250, 125, 125, 250, 125, 125, 250, 500],
    harmony: [2.0, 2.0, 1.5, 2.0, 1.5, 2.0, 1.5, 2.0, 1.5, 2.0, 1.5, 2.0, 1.5, 2.0, 1.5, 2.0, 1.5, 1.5],
  },
];
