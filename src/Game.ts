import { Scene as Scene } from "./Scene.js";

export type KeyOrCode = string;
export type KeyboardEventHandler = () => void;
export type EventHandlerSet = Set<KeyboardEventHandler>;

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
