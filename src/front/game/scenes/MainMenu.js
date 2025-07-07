import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { FONT_VT323 } from "../config/fonts";

export class MainMenu extends Scene {
  logoTween;

  constructor() {
    super("MainMenu");
  }

  create() {
    // Personalizar el cursor para toda la escena
    this.input.setDefaultCursor("crosshair");

    // Emitir evento de parar el juego cuando regresamos al menú
    EventBus.emit("game:stop");

    const bg = this.add.image(0, 0, "background").setOrigin(0);
    bg.displayWidth = this.sys.game.config.width;
    bg.displayHeight = this.sys.game.config.height;

    this.add.text(700, 550, "4Geeks", FONT_VT323).setDepth(100).setOrigin(0.5);

    const user_obj = this.registry.get("user");
    const user = user_obj?.username || "Invitado";

    this.add
      .text(384, 30, `welcome ${user}`, FONT_VT323)
      .setDepth(100)
      .setOrigin(0.5);

    // Battle button with border
    const buttonBg = this.add
      .rectangle(384, 80, 120, 40, 0x000000)
      .setStrokeStyle(2, 0xffffff)
      .setDepth(99)
      .setInteractive()
      .on("pointerdown", () => this.changeScene())
      .on("pointerover", () => {
        battleButton.setTint(0x6600cc);
        this.input.setDefaultCursor("pointer");
      })
      .on("pointerout", () => {
        battleButton.clearTint();
        buttonBg.setFillStyle(0x000000);
        this.input.setDefaultCursor("crosshair");
      });

    const battleButton = this.add
      .text(384, 80, "Battle!", FONT_VT323)
      .setDepth(100)
      .setOrigin(0.5);

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("Game");
  }
}
