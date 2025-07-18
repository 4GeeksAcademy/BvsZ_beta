import Phaser from "phaser";

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new Phaser.Events.EventEmitter();

// User events
export const USER_EVENT = "user:login";

// Game state events
export const GAME_START = "game:start";
export const GAME_STOP = "game:stop";
export const GAME_CLEANUP = "game:cleanup";
export const GAME_VICTORY = "game:victory";

// Game entity events
export const ZOMBIE_KILLED = "zombie:killed";

// Level events
export const LEVEL_CHANGE = "level:change";
export const LEVEL_COMPLETED = "level:completed";
export const LEVEL_NEXT = "level:next";

// Game time events
export const GAME_TIME_REQUEST = "game:time:request";
export const GAME_TIME_RESPONSE = "game:time:response";

// Turret events
export const REORGANIZE_TURRETS = "reorganize-turrets";

// Input method events
export const INPUT_METHOD_CHANGE = "input:method:change";

// Pause events
export const GAME_PAUSE = "game:pause";
export const GAME_RESUME = "game:resume";

// Scene events
export const SCENE_READY = "current-scene-ready";
