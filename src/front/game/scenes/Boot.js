import { Scene } from "phaser";
import { EventBus, USER_EVENT } from "../EventBus";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

    // Leer perfil global de localStorage y almacenarlo en el registry
    try {
      const profile = localStorage.getItem("profile");
      if (profile) {
        this.registry.set("user", JSON.parse(profile));
      }
    } catch (e) {
      // Si hay error, no hacer nada
    }

    this.load.image("background", "assets/bg.png");
  }

  create() {
    this.scene.start("Preloader");
  }
}
