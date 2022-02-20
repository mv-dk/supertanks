import {IActor} from './IActor.js';
import { IDrawable } from './IDrawable.js';
import { Position, Vector} from './Trigonometry.js';

/**
 * An actor is is an active game object.
 * It has a position, and a velocity.
 * It is updated in each game cycle, and drawn.
 */
export class Actor implements IActor, IDrawable {
    position: Position;
    velocity: Vector = new Vector(0, 0);
    gravity: Vector = new Vector(0, 0);

    constructor(position: Position = { x: 0, y: 0 }) {
        this.position = position;
    }

    get x() { return this.position.x; }
    get y() { return this.position.y; }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    draw(ctx: CanvasRenderingContext2D) {
    }
}
