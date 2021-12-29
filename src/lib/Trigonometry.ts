export type XY = {x: number, y: number};
export type Position = XY;

export class Vector {
    x: number;
    y: number;
    constructor(x: number, y:number) {
        this.x = x;
        this.y = y;
    }

    get length() {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    multiply(n: number): Vector {
        return new Vector(this.x*n, this.y*n);
    }

    add(p: Position): Vector {
        return new Vector(this.x + p.x, this.y + p.y);
    }

    static from(p1: XY, p2: XY):Vector {
        return new Vector(p2.x-p1.x, p2.y-p1.y);
    }
};

export class Circle { 
    center: Position;
    radius: number;

    constructor(center: Position, radius: number) {
        this.center = center;
        this.radius = radius;
    }

    intersects(p: Position) {
        return this.radius > Vector.from(this.center, p).length;
    }

    intersectsAny(ps: Position[]) {
        return ps.some(p => this.intersects(p));
    }
}

export class Rectangle {
    position: Position;
    width: number;
    height: number;

    constructor(p: Position, width: number, height: number) {
        this.position = p;
        this.width = width;
        this.height = height;
    }

    get midpoint() {
        return {x: this.position.x + this.width/2, y: this.position.y + this.height/2}; 
    }
    intersects(p: Position) {
        return this.position.x <= p.x && this.position.x + this.width >= p.x &&
            this.position.y <= p.y && this.position.y + this.height >= p.y;
    }
}
