import {Scene} from './Scene.js';
import { Tank, TankOption } from './Tank.js';
import { Game } from './Game.js';


export class IngameScene extends Scene {
    tanks: Tank[];
    turnIdx: number = 0;

    constructor() {
        super("ingame scene");
        this.setBackgroundColor("#000");
        this.tanks = new Array<Tank>();
    }

    addTanks(tankOptions: TankOption[]) {
        let margin = 50;
        let w = (Game.WIDTH - (2 * margin)) / (tankOptions.length - 1);
        let tankX = margin;
        tankOptions.forEach(o => {
            let t = new Tank(o.color, { x: tankX, y: 10 });
            t.alive = true;
            super.addActor(t);
            tankX += w;

            this.tanks.push(t);
        });

    }

    update() {
        super.update();
    }

    nextTurn() {
        let prevTurnIdx = this.turnIdx;
        do {
            this.turnIdx = (this.turnIdx + 1) % this.tanks.length;
            if (this.turnIdx == prevTurnIdx)
                throw new Error("All tanks are dead");
        } while (this.tanks[this.turnIdx].isDead);
    }

    get currentTank(): Tank {
        return this.tanks[this.turnIdx];
    }
}
