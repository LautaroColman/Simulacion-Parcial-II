import Phaser from 'phaser';

export class LiquidScene extends Phaser.Scene {
  constructor() {
    super({ key: 'liquid' });

    this.droplets = null;
    this.funnelGroup = null;
    this.emitterSprite = null;
    this.infoContainer = null;
    this.funnelX = 0;
    this.funnelParts = [];
    this.isDragging = false;
  }

  preload() {
    this.load.image('aguja', `${import.meta.env.BASE_URL}assets/aguja.png`);
    this.load.image('rampa', `${import.meta.env.BASE_URL}assets/rampa.png`);
  }

  create() {
    this.isDragging = false;

    const width = this.scale.width / 2;
    const height = this.scale.height;
    this.cameras.main.setViewport(0, 0, width, height);

    if (!this.textures.exists('micro_drop')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ff66, 1);
      graphics.fillCircle(2, 2, 2);
      graphics.generateTexture('micro_drop', 4, 4);
      graphics.destroy();
    }

    this.add.rectangle(0, 0, width, height, 0x0a0f1a).setOrigin(0, 0);
    this.add.text(20, 20, 'PANTALLA 1: Emisor de Líquido', {
      fontSize: '18px',
      color: '#00adb5',
      fontFamily: 'Courier New'
    });

    const textStyle = {
      fontSize: '12px',
      color: '#94a3b8',
      fontFamily: 'Courier New'
    };
    const infoTexts = [
      this.add.text(20, 45, 'Arrastra con el mouse para mover el canal', textStyle),
      this.add.text(20, 63, 'Llega a 50 células para ganar', textStyle),
      this.add.text(20, 81, 'Presiona R para reiniciar | H para ocultar info', textStyle)
    ];
    this.infoContainer = this.add.container(0, 0, infoTexts);

    this.input.keyboard.on('keydown-H', () => {
      this.infoContainer.visible = !this.infoContainer.visible;
    });

    this.droplets = this.physics.add.group();
    this.funnelGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    this.funnelX = width / 2;
    this.createMovableFunnel(this.funnelX, 380, width);
    this.configureFunnelDragging(width);

    const margin = 45;
    this.emitterSprite = this.add.sprite(margin, 115, 'aguja');
    this.emitterSprite.setOrigin(0.5, 0);
    this.emitterSprite.setDisplaySize(40, 80);

    this.tweens.add({
      targets: this.emitterSprite,
      x: width - margin,
      duration: 3500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.time.addEvent({
      delay: 40,
      callback: this.spawnMicroDropletFromNeedle,
      callbackScope: this,
      loop: true
    });

    this.physics.add.collider(this.droplets, this.funnelGroup, (drop) => {
      if (drop && drop.active) {
        drop.destroy();
      }
    });
  }

  configureFunnelDragging(sceneWidth) {
    this.input.on('pointerdown', (pointer) => {
      if (pointer.x <= sceneWidth) {
        this.isDragging = true;
        this.moveFunnelTo(pointer.x, sceneWidth);
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (this.isDragging && pointer.isDown) {
        this.moveFunnelTo(pointer.x, sceneWidth);
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });
    this.input.on('pointerupoutside', () => {
      this.isDragging = false;
    });
  }

  createMovableFunnel(centerX, topY, sceneWidth) {
    this.funnelParts = [];

    const gapWidth = 48;
    const wingLength = sceneWidth;
    const wallHeight = 130;
    const thickness = 12;

    const leftWing = this.createFunnelPiece(
      centerX - gapWidth / 2 - wingLength / 2,
      topY,
      wingLength,
      thickness
    );
    const rightWing = this.createFunnelPiece(
      centerX + gapWidth / 2 + wingLength / 2,
      topY,
      wingLength,
      thickness
    );
    const leftWall = this.createFunnelPiece(
      centerX - gapWidth / 2 - thickness / 2,
      topY + wallHeight / 2 - thickness / 2,
      thickness,
      wallHeight
    );
    const rightWall = this.createFunnelPiece(
      centerX + gapWidth / 2 + thickness / 2,
      topY + wallHeight / 2 - thickness / 2,
      thickness,
      wallHeight
    );

    [leftWing, rightWing, leftWall, rightWall].forEach((sprite) => {
      this.funnelParts.push({ sprite, offsetX: sprite.x - centerX });
    });
  }

  createFunnelPiece(x, y, width, height) {
    const piece = this.add.sprite(x, y, 'rampa');
    piece.setDisplaySize(width, height);
    this.physics.add.existing(piece);
    piece.body.setImmovable(true);
    piece.body.setAllowGravity(false);
    piece.body.setSize(piece.width, piece.height);
    this.funnelGroup.add(piece);
    return piece;
  }

  moveFunnelTo(targetX, sceneWidth) {
    const margin = 45;
    const clampedX = Phaser.Math.Clamp(targetX, margin, sceneWidth - margin);
    this.funnelX = clampedX;

    for (const part of this.funnelParts) {
      part.sprite.x = clampedX + part.offsetX;
      part.sprite.body.updateFromGameObject();
    }
  }

  spawnMicroDropletFromNeedle() {
    if (!this.droplets || !this.emitterSprite) return;

    const tipX = this.emitterSprite.x;
    const tipY = this.emitterSprite.y + this.emitterSprite.displayHeight;
    const drop = this.physics.add.sprite(
      tipX + Phaser.Math.Between(-2, 2),
      tipY,
      'micro_drop'
    );

    this.droplets.add(drop);
    drop.body.setCircle(2);
    drop.body.setBounce(0.15);
    drop.body.setGravityY(500);
    drop.setVelocity(Phaser.Math.Between(-8, 8), Phaser.Math.Between(120, 170));
  }

  update() {
    if (!this.droplets) return;

    const screenHeight = this.scale.height;
    const killZoneY = screenHeight - 20;
    const drops = this.droplets.getChildren();

    for (let i = drops.length - 1; i >= 0; i -= 1) {
      const drop = drops[i];
      if (!drop || !drop.active || drop.y < killZoneY) continue;

      this.game.events.emit('liquid-hit-bottom', {
        impactX: drop.x,
        normalizedY: drop.y / screenHeight
      });
      drop.destroy();
    }
  }
}
