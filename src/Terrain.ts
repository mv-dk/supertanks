import { Actor } from './lib/Actor.js';
import { Position,Circle } from './lib/Trigonometry.js';

import { TerrainNode as TerrainNode } from './TerrainNode.js';

export class Terrain extends Actor {
    static NODE_SIZE: number = 768;
    static MIN_NODE_SIZE: number = 4;

    node: TerrainNode;

    constructor(p: Position, size: number = Terrain.NODE_SIZE) {
        super(p);
        this.node = new TerrainNode(p, Math.round(size));
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.node.draw(ctx);
    }

    intersects(p: Position): boolean {
        return this.node.intersects(p);
    }

    nodeAt(p: Position): TerrainNode | undefined {
        return this.node.nodeAt(p);
    }

    countNodes(): number {
        return this.node.countNodes();
    }

    removeCircle(c: Circle) {
        this.node.removeCircle(c);
    }
}
