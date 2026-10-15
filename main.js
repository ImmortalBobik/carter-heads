import { Game } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);

  // Buttons & Controls
  const restartBtn = document.getElementById('restartBtn');
  const pauseToggleBtn = document.getElementById('pauseToggleBtn');
  const resumeBtn = document.getElementById('resumeBtn');
      const mode1PBtn = document.getElementById('mode1P');
  const mode2PBtn = document.getElementById('mode2P');
  const currentModeLabel = document.getElementById('currentModeLabel');
  const difficultySelect = document.getElementById('difficultySelect');
  const p2Tag = document.getElementById('p2Tag');
  const p2Hint = document.getElementById('p2Hint');

  // Modal Buttons
  const gameOverModal = document.getElementById('gameOverModal');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // Restart match
  restartBtn.addEventListener('click', () => {
    game.start();
  });

  // Pause toggling
  pauseToggleBtn.addEventListener('click', () => {
    game.togglePause();
  });

  resumeBtn.addEventListener('click', () => {
    game.togglePause();
  });

  
  // Mode switching (1P vs 2P)
  mode1PBtn.addEventListener('click', () => {
    mode1PBtn.classList.add('active');
    mode2PBtn.classList.remove('active');
    game.isTwoPlayer = false;
    currentModeLabel.innerText = '1P vs AI';
    p2Tag.innerText = 'CPU / AI';
    difficultySelect.style.display = 'inline-block';
    p2Hint.classList.add('hidden');
    game.start();
  });

  mode2PBtn.addEventListener('click', () => {
    mode2PBtn.classList.add('active');
    mode1PBtn.classList.remove('active');
    game.isTwoPlayer = true;
    currentModeLabel.innerText = '2 Players (Local)';
    p2Tag.innerText = 'PLAYER 2';
    difficultySelect.style.display = 'none';
    p2Hint.classList.remove('hidden');
    game.start();
  });

  // Difficulty selection
  difficultySelect.addEventListener('change', (e) => {
    game.aiDifficulty = e.target.value;
  });

  // Modal actions
  playAgainBtn.addEventListener('click', () => {
    gameOverModal.close();
    game.start();
  });

  closeModalBtn.addEventListener('click', () => {
    gameOverModal.close();
  });

  // Mobile Touch Controls
  const btnTouchLeft = document.getElementById('btnTouchLeft');
  const btnTouchRight = document.getElementById('btnTouchRight');
  const btnTouchJump = document.getElementById('btnTouchJump');
  const btnTouchKick = document.getElementById('btnTouchKick');

  const setupTouch = (el, prop) => {
    if (!el) return;
    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      game.touchControls[prop] = true;
    }, { passive: false });
    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      game.touchControls[prop] = false;
    }, { passive: false });
    el.addEventListener('mousedown', () => {
      game.touchControls[prop] = true;
    });
    el.addEventListener('mouseup', () => {
      game.touchControls[prop] = false;
    });
    el.addEventListener('mouseleave', () => {
      game.touchControls[prop] = false;
    });
  };

  setupTouch(btnTouchLeft, 'p1Left');
  setupTouch(btnTouchRight, 'p1Right');
  setupTouch(btnTouchJump, 'p1Jump');
  setupTouch(btnTouchKick, 'p1Kick');

  // Start initial match
  game.start();
});
