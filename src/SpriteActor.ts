import {Actor} from './Actor.js';
import {Position} from './Trigonometry.js';

class SpriteActor extends Actor {
    image: HTMLImageElement;

    constructor(sprite: string, position: Position = { x: 0, y: 0 }) {
        super(position);
        this.image = new HTMLImageElement();
        this.image.src = sprite;
    }

    draw(ctx: CanvasRenderingContext2D) {
        let width = this.image.width;
        let height = this.image.height;
        ctx.drawImage(this.image, this.x - width / 2, this.y - height / 2);
    }
}
