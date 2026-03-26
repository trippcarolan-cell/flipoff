import { Board } from './Board.js';
import { SoundEngine } from './SoundEngine.js';
import { KeyboardController } from './KeyboardController.js';
import { WeekendCountdown } from './WeekendCountdown.js';

document.addEventListener('DOMContentLoaded', () => {
  const boardContainer = document.getElementById('board-container');
  const soundEngine = new SoundEngine();
  const board = new Board(boardContainer, soundEngine);
  const countdown = new WeekendCountdown(board);
  new KeyboardController(soundEngine);

  countdown.start();

  let audioInitialized = false;
  let experienceLive = false;

  const activateExperience = async () => {
    if (!audioInitialized) {
      audioInitialized = true;
      await soundEngine.init();
      soundEngine.resume();
    }

    if (!experienceLive) {
      experienceLive = true;
      document.body.classList.add('experience-live');
      document.documentElement.requestFullscreen().catch(() => {});
      document.removeEventListener('click', activateExperience);
      document.removeEventListener('keydown', activateExperience);
    }
  };

  document.addEventListener('click', activateExperience);
  document.addEventListener('keydown', activateExperience);

  const volumeBtn = document.getElementById('volume-btn');
  if (volumeBtn) {
    volumeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await activateExperience();
      const muted = soundEngine.toggleMute();
      volumeBtn.classList.toggle('muted', muted);
    });
  }
});
