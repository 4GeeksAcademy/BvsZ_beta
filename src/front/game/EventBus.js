import Phaser from "phaser";

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new Phaser.Events.EventEmitter();

// Permite emitir y escuchar el usuario logueado entre React y Phaser
export const USER_EVENT = "user:login";

// Game time events
export const GAME_TIME_REQUEST = "game:time:request";
export const GAME_TIME_RESPONSE = "game:time:response";

// Level events
export const LEVEL_COMPLETED = "level:completed";
export const LEVEL_NEXT = "level:next";
