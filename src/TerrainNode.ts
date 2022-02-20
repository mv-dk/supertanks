import { Position, Circle, Rectangle } from "./lib/Trigonometry.js";
import { IDrawable } from "./lib/IDrawable.js";

import {Terrain} from './Terrain.js';

export class TerrainNode implements IDrawable {
    color: string = "green";
    position: Position;
    size: number;
    nodes: Set<TerrainNode> = new Set();
    isLeaf: boolean = true;

    constructor(p: Position, size: number) {
        this.position = p;
        this.position.x = Math.round(this.position.x);
        this.position.y = Math.round(this.position.y);
        this.size = Math.round(size);
    }

    get midpoint(): Position {
        return { x: this.position.x + this.size / 2, y: this.position.y + this.size / 2 };
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.isLeaf) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.size, this.size);

            ctx.lineWidth = 1;
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(this.position.x, this.position.y, this.size, this.size);
            ctx.closePath();
        } else {
            this.nodes.forEach(x => x.draw(ctx));
        }
    }

    subdivide() {
        if (this.size <= Terrain.MIN_NODE_SIZE)
            return;
        this.isLeaf = false;
        let sz = this.size / 2;
        let newNodes = [
            new TerrainNode(this.position, sz),
            new TerrainNode({ x: this.position.x + sz, y: this.position.y }, sz),
            new TerrainNode({ x: this.position.x, y: this.position.y + sz }, sz),
            new TerrainNode({ x: this.position.x + sz, y: this.position.y + sz }, sz)
        ];
        newNodes.forEach(x => this.nodes.add(x));
    }

    print() {
        console.log(`x: ${this.position.x}, y: ${this.position.y}, size: ${this.size}`);
    }

    intersects(p: Position): boolean {
        let xx = this.position.x + this.size;
        let yy = this.position.y + this.size;
        let inArea = this.position.x <= p.x && xx >= p.x &&
            this.position.y <= p.y && yy >= p.y;

        return inArea;
    }

    nodeAt(p: Position): TerrainNode {
        if (this.isLeaf) {
            if (this.intersects(p))
                return this;
            return undefined;
        }
        for (let n of this.nodes) {
            if (n.intersects(p))
                return n.nodeAt(p);
        }
        return undefined;
    }

    countNodes(): number {
        if (this.isLeaf)
            return 1;
        let i = 0;
        for (let n of this.nodes) {
            i += n.countNodes();
        }
        return i;
    }

    get nw(): Position { return this.position; }
    get ne(): Position { return { x: this.position.x + this.size, y: this.position.y }; }
    get sw(): Position { return { x: this.position.x, y: this.position.y + this.size }; }
    get se(): Position { return { x: this.position.x + this.size, y: this.position.y + this.size }; }

    get rect(): Rectangle {
        return new Rectangle(this.position, this.size, this.size);
    }

    overlapsCircle(c: Circle): boolean {
        let p0 = { x: c.center.x, y: c.center.y };
        if (p0.x < this.nw.x)
            p0.x = this.nw.x;
        else if (p0.x > this.ne.x)
            p0.x = this.ne.x;
        if (p0.y < this.nw.y)
            p0.y = this.nw.y;
        else if (p0.y > this.sw.y)
            p0.y = this.sw.y;

        return c.intersects(p0);
    }

    isInsideCircle(c: Circle): boolean {
        let result = c.intersects(this.nw) &&
            c.intersects(this.ne) &&
            c.intersects(this.sw) &&
            c.intersects(this.se);
        return result;
    }

    removeCircle(c: Circle) {
        if (this.isLeaf) {
            if (this.overlapsCircle(c)) {
                if (this.isInsideCircle(c)) {
                    this.nodes = new Set();
                } else {
                    this.subdivide();
                    this.removeCircle(c);
                }
            }
            return;
        }

        let nodesToDelete = new Set<TerrainNode>();
        for (let n of this.nodes) {
            if (n.overlapsCircle(c)) {
                n.color = "yellow";
                if (n.isInsideCircle(c) || n.size <= Terrain.MIN_NODE_SIZE) {
                    nodesToDelete.add(n);
                } else {
                    if (n.isLeaf) {
                        n.subdivide();
                        n.removeCircle(c);
                    } else {
                        n.removeCircle(c);
                    }
                }
            }

        }
        nodesToDelete.forEach(x => this.nodes.delete(x));
    }
}
