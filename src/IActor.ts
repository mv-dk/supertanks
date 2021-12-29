import { IDrawable } from "./IDrawable.js";

export interface IActor extends IDrawable {
    update();
    draw(ctx: CanvasRenderingContext2D);
}
