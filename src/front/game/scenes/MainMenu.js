import {
  EventBus,
  GAME_STOP,
  SCENE_READY,
  INPUT_METHOD_CHANGE,
} from "../EventBus";
import { Scene } from "phaser";
import { FONT_VT323 } from "../config/fonts";

export class MainMenu extends Scene {
  logoTween;

  constructor() {
    super("MainMenu");
    this.selectedInputMethod = "mouse"; // Por defecto mouse
  }

  create() {
    // Personalizar el cursor para toda la escena
    this.input.setDefaultCursor("crosshair");

    // Emitir evento de parar el juego cuando regresamos al menú
    EventBus.emit(GAME_STOP);

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

    // Título de selección de método de entrada
    this.add
      .text(184, 80, "Input Method:", FONT_VT323)
      .setDepth(100)
      .setOrigin(0.5);

    // Botón para método de ratón (mouse)
    const mouseButtonBg = this.add
      .rectangle(324, 85, 50, 50, 0x000000)
      .setStrokeStyle(2, 0xffffff)
      .setDepth(99)
      .setInteractive()
      .on("pointerdown", () => this.selectInputMethod("mouse"))
      .on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
      })
      .on("pointerout", () => {
        this.input.setDefaultCursor("crosshair");
      });

    // Icono de ratón
    const mouseIcon = this.add
      .text(324, 85, "🖱️", { fontSize: "32px" })
      .setDepth(100)
      .setOrigin(0.5);

    // Botón para método de teclado (keyboard)
    const keyboardButtonBg = this.add
      .rectangle(400, 85, 50, 50, 0x000000)
      .setStrokeStyle(2, 0xffffff)
      .setDepth(99)
      .setInteractive()
      .on("pointerdown", () => this.selectInputMethod("keyboard"))
      .on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
      })
      .on("pointerout", () => {
        this.input.setDefaultCursor("crosshair");
      });

    // Icono de teclado
    const keyboardIcon = this.add
      .text(400, 85, "⌨️", { fontSize: "32px" })
      .setDepth(100)
      .setOrigin(0.5);

    // Almacenar referencias para actualizar visuales
    this.mouseButtonBg = mouseButtonBg;
    this.keyboardButtonBg = keyboardButtonBg;

    // Establecer selección por defecto
    this.updateInputMethodVisuals();

    // Battle button with border
    const buttonBg = this.add
      .rectangle(550, 85, 120, 40, 0x000000)
      .setStrokeStyle(2, 0xffffff)
      .setDepth(99)
      .setInteractive()
      .on("pointerdown", () => this.changeScene())
      .on("pointerover", () => {
        battleButton.setTint(0xa1d84a);
        this.input.setDefaultCursor("pointer");
      })
      .on("pointerout", () => {
        battleButton.clearTint();
        buttonBg.setFillStyle(0x000000);
        this.input.setDefaultCursor("crosshair");
      });

    const battleButton = this.add
      .text(550, 85, "Deploy!", FONT_VT323)
      .setDepth(100)
      .setOrigin(0.5);

    EventBus.emit(SCENE_READY, this);
  }

  // Método para seleccionar el tipo de entrada (mouse o teclado)
  selectInputMethod(method) {
    this.selectedInputMethod = method;
    this.updateInputMethodVisuals();

    // Guardar la preferencia para que Game.tsx pueda accederla
    this.registry.set("inputMethod", method);

    // Emitir evento para que PhaserGame.jsx pueda reaccionar
    EventBus.emit(INPUT_METHOD_CHANGE, { method });
  }

  // Actualizar visuales según el método seleccionado
  updateInputMethodVisuals() {
    if (this.selectedInputMethod === "mouse") {
      this.mouseButtonBg.setFillStyle(0x222222);
      this.mouseButtonBg.setStrokeStyle(2, 0xa1d84a);
      this.keyboardButtonBg.setFillStyle(0x000000);
      this.keyboardButtonBg.setStrokeStyle(2, 0xffffff);
    } else {
      this.keyboardButtonBg.setFillStyle(0x222222);
      this.keyboardButtonBg.setStrokeStyle(2, 0xa1d84a);
      this.mouseButtonBg.setFillStyle(0x000000);
      this.mouseButtonBg.setStrokeStyle(2, 0xffffff);
    }
  }

  changeScene() {
    // Pasar el método de entrada seleccionado a la escena Game
    this.scene.start("Game");
  }
}
