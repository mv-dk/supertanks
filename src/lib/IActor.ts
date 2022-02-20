import { IDrawable } from "./IDrawable.js";

/**
 * Represents an Actor. An actor can be updated (at interval specified by
 * Game.INTERVAL), and drawed (at the same interval).
 */
export interface IActor extends IDrawable {
    update();
    draw(ctx: CanvasRenderingContext2D);
}
