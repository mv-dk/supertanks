import { Scene as Scene } from "./Scene.js";

export type KeyOrCode = string;
export type KeyboardEventHandler = () => void;
export type EventHandlerSet = Set<KeyboardEventHandler>;

/**
 * Game is the one responsible for creating a canvas.
 * It contains an active Scene object.
 * The update() and draw() methods are invoked on the
 * active Scene object at regular intervals (specified
 * by Game.INTERVAL).
 * 
 * Changing the scene is done by calling activateScene.
 * When changing the scene, delete() is called on the 
 * active scene, and create() and activate() is called
 * on the new scene.
 */
export class Game {
    canvas: HTMLCanvasElement;
    activeScene: Scene;
    activeSceneHandle: number;

    static WIDTH = 800;
    static HEIGHT = 600;
    static INTERVAL = 20;


    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = Game.WIDTH;
        this.canvas.height = Game.HEIGHT;
        document.body.appendChild(this.canvas);
    }

    activateScene(scene: Scene) {
        if (this.activeScene != undefined && this.activeScene.active) {
            clearInterval(this.activeSceneHandle);
            this.activeScene.delete();
        }

        this.activeScene = scene;
        this.activeScene.setCanvas(this.canvas);
        this.activeScene.create();
        this.activeScene.activate();
        this.start();
    }

    start() {
        this.activeSceneHandle = setInterval(() => {
            this.activeScene.update();
            this.activeScene.draw();
        }, Game.INTERVAL);

    }
}
