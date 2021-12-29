import { Actor } from "./lib/Actor.js";
import { Game } from "./lib/Game.js";
import { Position } from './lib/Trigonometry.js';

export type TankOption = {name:string, color:string};

export class Tank extends Actor {
    color: string;
    size: number = 20;
    angle: number;
    power: number;
    alive: boolean;

    constructor(color: string, position: Position = { x: 0, y: 0 }) {
        super(position);
        this.color = color;
        this.gravity.y = 1;
        this.angle = 0;
    }

    get isDead() { return !this.alive; }
    get isAlive() { return this.alive; }

    update() {
        super.update();
        if (this.y + this.velocity.y > Game.HEIGHT) {
            this.velocity.y = 0;
            this.position.y = Game.HEIGHT;
        } else {
            this.velocity.y += this.gravity.y;
        }

        if (this.x + this.velocity.x < 0) {
            this.velocity.x = 0;
            this.position.x = 0;
        } else if (this.x + this.velocity.x > Game.WIDTH) {
            this.velocity.x = 0;
            this.position.x = Game.WIDTH;
        } else {
            this.velocity.x += this.gravity.x;
        }
    }

    increaseAngle(amount: number = 1) {
        let angleInDegrees = Math.round(this.angle * 180 / Math.PI);
        angleInDegrees += amount;
        if (angleInDegrees < 0)
            angleInDegrees += 180;
        else if (angleInDegrees > 180)
            angleInDegrees -= 180;

        this.angle = angleInDegrees * Math.PI / 180;
    }

    decreaseAngle(amount: number = 1) {
        this.increaseAngle(-amount);
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Body    
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI, true);
        ctx.fill();
        ctx.closePath();

        // Cannon
        ctx.beginPath();
        ctx.lineWidth = this.size / 3;
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.x, this.y - ctx.lineWidth / 2);
        let toX = this.x + Math.cos(this.angle) * this.size * 2;
        let toY = this.y - Math.sin(this.angle) * this.size * 2 - ctx.lineWidth / 2;
        ctx.lineTo(toX, toY);
        ctx.closePath();
        ctx.stroke();
    }
}
