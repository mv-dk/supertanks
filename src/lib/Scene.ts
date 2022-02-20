import {Game, KeyOrCode, EventHandlerSet, KeyboardEventHandler} from './Game.js';
import {IActor} from './IActor.js';

/**
 * A scene is a container for IActors.
 * If the scene is active, the update() method calls update() on all actors,
 * and the draw() method calls draw() on all actors.
 * 
 * A Scene also has sets of key handlers. 
 */
export class Scene {
    actors: Set<IActor>;
    active: Boolean;
    paused: Boolean;
    canvas: HTMLCanvasElement;
    backgroundColor: string;
    name: string;

    keyDownHandlers: Map<KeyOrCode, EventHandlerSet>;
    keyUpHandlers: Map<KeyOrCode, EventHandlerSet>;
    keysDown: Set<KeyOrCode>; // Keys that are held down at this moment
    keysJustPressed: Set<KeyOrCode>; // Keys that were pressed just now

    constructor(name: string) {
        this.name = name;
        this.actors = new Set<IActor>();
        this.active = false;
        this.paused = false;
        this.backgroundColor = "#000";

        this.keyDownHandlers = new Map<KeyOrCode, EventHandlerSet>();
        this.keyUpHandlers = new Map<KeyOrCode, EventHandlerSet>();
        this.keysDown = new Set<KeyOrCode>();
        this.keysJustPressed = new Set<KeyOrCode>();

        document.addEventListener("keydown", e => this.keysDown.add(e.key), false);
        document.addEventListener("keyup", e => this.keysDown.delete(e.key), false);
    }

    addKeyDownHandler(key: KeyOrCode, f: KeyboardEventHandler) {
        if (!this.keyDownHandlers.has(key)) {
            this.keyDownHandlers.set(key, new Set());
        }
        this.keyDownHandlers.get(key).add(f);
    }

    removeKeyDownHandler(key: KeyOrCode, f?: KeyboardEventHandler) {
        if (f == undefined) {
            this.keyDownHandlers.delete(key);
        } else {
            this.keyDownHandlers.get(key)?.delete(f);
        }
    }

    keyDownHandler(e: KeyboardEvent) {
        if (this.keyDownHandlers.has(e.key)) {
            this.keyDownHandlers.get(e.key).forEach(f => f());
        }
    }

    addKeyUpHandler(key: KeyOrCode, f: KeyboardEventHandler) {
        if (!this.keyUpHandlers.has(key)) {
            this.keyUpHandlers.set(key, new Set());
        }
        this.keyUpHandlers.get(key).add(f);
    }

    removeKeyUpHandler(key: KeyOrCode, f?: KeyboardEventHandler) {
        if (f == undefined) {
            this.keyUpHandlers.delete(key);
        } else {
            this.keyUpHandlers.get(key)?.delete(f);
        }
    }

    keyUpHandler(e: KeyboardEvent) {
        if (this.keyUpHandlers.has(e.key)) {
            this.keyUpHandlers.get(e.key).forEach(f => f());
        }
    }

    setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    setBackgroundColor(bgColor: string) {
        this.backgroundColor = bgColor;
    }

    addActor(actor: IActor) {
        this.actors.add(actor);
    }

    create() { }

    activate() {
        this.active = true;
    }

    update() {
        this.keysDown.forEach(k => {
            this.keyDownHandlers.get(k)?.forEach(h => h());
        });
        this.actors.forEach(actor => {
            actor.update();
        });
    }

    draw() {
        if (this.canvas == undefined || !this.active)
            return;

        let ctx = this.canvas.getContext("2d");
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, Game.WIDTH, Game.HEIGHT);

        this.actors.forEach(a => a.draw(ctx));

        return ctx;
    }

    delete() {
        this.canvas = undefined;
        this.active = false;
    }
}
