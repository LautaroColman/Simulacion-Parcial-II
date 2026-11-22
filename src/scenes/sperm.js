import Phaser from 'phaser';

export class SpermScene extends Phaser.Scene {
  constructor() {
    super({ key: 'sperm' });

    this.gridSize = 20;
    this.cols = 0;
    this.rows = 0;
    this.grid = [];
    this.elapsedTime = 0;
    this.stepInterval = 200;
    this.cellCount = 0;
    this.countText = null;
    this.graphics = null;

    this.handleLiquidHit = (data) => this.spawnAutomataFromLiquid(data);
  }

  preload() {
    this.load.image('fondo_automata', `${import.meta.env.BASE_URL}assets/fondo_automata.png`);
  }

  create() {
    const halfWidth = this.scale.width / 2;
    const height = this.scale.height;

    this.cameras.main.setViewport(halfWidth, 0, halfWidth, height);
    this.cols = Math.floor(halfWidth / this.gridSize);
    this.rows = Math.floor(height / this.gridSize);
    this.grid = this.createEmptyGrid();
    this.elapsedTime = 0;
    this.cellCount = 0;

    this.add.rectangle(0, 0, halfWidth, height, 0x16213e).setOrigin(0, 0);

    const background = this.add.image(0, 0, 'fondo_automata');
    background.setOrigin(0, 0);
    background.setDisplaySize(halfWidth, height);
    background.setAlpha(0.35);

    this.graphics = this.add.graphics();

    this.add.text(20, 20, 'PANTALLA 2: Juego de la Vida', {
      fontSize: '18px',
      color: '#ff2e63',
      fontStyle: 'bold'
    });

    this.countText = this.add.text(20, 45, 'Células Vivas: 0', {
      fontSize: '15px',
      color: '#00fff5',
      fontStyle: 'bold'
    });

    // Cada impacto agrega un patrón. Se quita el listener al apagar esta escena,
    // así los reinicios no dejan callbacks antiguos ni duplican los impactos.
    this.game.events.on('liquid-hit-bottom', this.handleLiquidHit);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('liquid-hit-bottom', this.handleLiquidHit);
    });
  }

  createEmptyGrid() {
    return Array.from(
      { length: this.cols },
      () => Array(this.rows).fill(0)
    );
  }

  spawnAutomataFromLiquid(data = {}) {
    const halfWidth = this.scale.width / 2;
    const impactX = Number.isFinite(data.impactX) ? data.impactX : halfWidth / 2;
    const normalizedY = Number.isFinite(data.normalizedY)
      ? Phaser.Math.Clamp(data.normalizedY, 0, 1)
      : 1;

    const targetCol = Phaser.Math.Clamp(
      Math.floor(impactX / this.gridSize),
      1,
      this.cols - 2
    );
    const targetRow = Phaser.Math.Clamp(
      Math.floor(normalizedY * this.rows) - 2,
      1,
      this.rows - 3
    );

    // Patrón Glider (planeador) del Juego de la Vida.
    const pattern = [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1]
    ];

    for (let rowOffset = 0; rowOffset < pattern.length; rowOffset += 1) {
      for (let colOffset = 0; colOffset < pattern[rowOffset].length; colOffset += 1) {
        if (pattern[rowOffset][colOffset] !== 1) continue;

        const col = targetCol + colOffset - 1;
        const row = targetRow + rowOffset - 1;

        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
          this.grid[col][row] = 1;
        }
      }
    }

    this.updateCellCount();
  }

  countNeighbors(grid, col, row) {
    let count = 0;

    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
        if (colOffset === 0 && rowOffset === 0) continue;

        const neighborCol = col + colOffset;
        const neighborRow = row + rowOffset;

        if (
          neighborCol >= 0 && neighborCol < this.cols &&
          neighborRow >= 0 && neighborRow < this.rows
        ) {
          count += grid[neighborCol][neighborRow];
        }
      }
    }

    return count;
  }

  update(_time, delta) {
    this.elapsedTime += delta;

    while (this.elapsedTime >= this.stepInterval) {
      this.elapsedTime -= this.stepInterval;
      this.stepLifeCycle();
    }

    this.drawGrid();
  }

  stepLifeCycle() {
    const nextGrid = this.createEmptyGrid();
    let aliveCount = 0;

    for (let col = 0; col < this.cols; col += 1) {
      for (let row = 0; row < this.rows; row += 1) {
        const currentState = this.grid[col][row];
        const neighbors = this.countNeighbors(this.grid, col, row);

        if (neighbors === 3 || (currentState === 1 && neighbors === 2)) {
          nextGrid[col][row] = 1;
          aliveCount += 1;
        }
      }
    }

    this.grid = nextGrid;
    if (this.cellCount !== aliveCount) {
      this.cellCount = aliveCount;
      this.countText.setText(`Células Vivas: ${this.cellCount}`);
    }
  }

  updateCellCount() {
    let count = 0;

    for (let col = 0; col < this.cols; col += 1) {
      for (let row = 0; row < this.rows; row += 1) {
        if (this.grid[col][row] === 1) count += 1;
      }
    }

    this.cellCount = count;
    this.countText.setText(`Células Vivas: ${this.cellCount}`);
  }

  drawGrid() {
    this.graphics.clear();
    this.graphics.fillStyle(0x00ff66, 1);

    const radius = this.gridSize / 2;
    for (let col = 0; col < this.cols; col += 1) {
      for (let row = 0; row < this.rows; row += 1) {
        if (this.grid[col][row] !== 1) continue;

        const centerX = col * this.gridSize + radius;
        const centerY = row * this.gridSize + radius;
        this.graphics.fillCircle(centerX, centerY, radius - 1);
      }
    }
  }
}
