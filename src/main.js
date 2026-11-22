import Phaser from 'phaser';
import './style.css';
import { LiquidScene } from './scenes/liquid.js';
import { SpermScene } from './scenes/sperm.js';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const INITIAL_TIME = 30;
const WIN_CELL_COUNT = 50;

class MainController extends Phaser.Scene {
  constructor() {
    super({ key: 'MainController' });

    this.timeLeft = INITIAL_TIME;
    this.timerEvent = null;
    this.timerText = null;
    this.isGameOver = false;
    this.resultImage = null;
  }

  preload() {
    this.load.image('win', `${import.meta.env.BASE_URL}assets/win.png`);
    this.load.image('lose', `${import.meta.env.BASE_URL}assets/lose.png`);
  }

  create() {
    this.timerText = this.add.text(GAME_WIDTH / 2, 15, `Tiempo: ${INITIAL_TIME}s`, {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#16213e',
      padding: { x: 10, y: 5 },
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);
    this.timerText.setDepth(1000);

    this.startTimer();
    this.input.keyboard.on('keydown-R', this.restartGame, this);
    this.launchGameScenes();
  }

  launchGameScenes() {
    this.scene.launch('liquid');
    this.scene.launch('sperm');
    // El temporizador y las pantallas de resultado permanecen por encima.
    this.scene.bringToTop('MainController');
  }

  startTimer() {
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (this.isGameOver) return;

    const automatonScene = this.scene.get('sperm');
    if (automatonScene && automatonScene.cellCount >= WIN_CELL_COUNT) {
      this.finishGame('win');
    }
  }

  updateTimer() {
    if (this.isGameOver) return;

    this.timeLeft -= 1;
    this.timerText.setText(`Tiempo: ${this.timeLeft}s`);

    if (this.timeLeft <= 5) {
      this.timerText.setColor('#ff2e63');
    }

    if (this.timeLeft <= 0) {
      this.finishGame('lose');
    }
  }

  finishGame(result) {
    if (this.isGameOver) return;

    this.isGameOver = true;
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }

    this.resultImage = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, result);
    this.resultImage.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    this.resultImage.setDepth(2000);

    this.scene.pause('liquid');
    this.scene.pause('sperm');
  }

  restartGame() {
    this.isGameOver = false;
    this.timeLeft = INITIAL_TIME;
    this.timerText.setText(`Tiempo: ${INITIAL_TIME}s`);
    this.timerText.setColor('#ffffff');

    if (this.resultImage) {
      this.resultImage.destroy();
      this.resultImage = null;
    }

    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }

    // Detener y relanzar las escenas reinicia sus temporizadores, grillas y
    // listeners, evitando que los eventos se acumulen entre partidas.
    this.scene.stop('liquid');
    this.scene.stop('sperm');
    this.startTimer();
    this.launchGameScenes();
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0f1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainController, LiquidScene, SpermScene]
};

const game = new Phaser.Game(config);

export default game;
