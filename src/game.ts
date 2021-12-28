
type KeyOrCode = string;
type KeyboardEventHandler = () => void;
type EventHandlerSet = Set<KeyboardEventHandler>;

class Game {
    canvas: HTMLCanvasElement;
    activeScene: Scene;
    activeSceneHandle: number;

    static WIDTH = 800;
    static HEIGHT = 600;
    static INTERVAL = 20;

    
    constructor(){
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

class Scene {
    actors: Set<Actor>;
    active: Boolean;
    paused: Boolean;
    canvas: HTMLCanvasElement;
    backgroundColor: string;
    name: string;
    
    keyDownHandlers: Map<KeyOrCode, EventHandlerSet>;
    keyUpHandlers: Map<KeyOrCode, EventHandlerSet>;
    keysDown: Set<KeyOrCode> // Keys that are held down at this moment
    keysJustPressed: Set<KeyOrCode> // Keys that were pressed just now
    
    constructor(name: string){
        this.name = name;
        this.actors = new Set<Actor>();
        this.active = false;
        this.paused = false;
        this.backgroundColor = "#000";

        this.keyDownHandlers = new Map<KeyOrCode, EventHandlerSet>();
        this.keyUpHandlers = new Map<KeyOrCode, EventHandlerSet>();
        this.keysDown = new Set<KeyOrCode>();
        this.keysJustPressed = new Set<KeyOrCode>();

        document.addEventListener("keydown", e => this.keysDown.add(e.key), false);
        document.addEventListener("keyup", e => this.keysDown.delete(e.key), false);
    }

    addKeyDownHandler(key: KeyOrCode, f: KeyboardEventHandler) {
        if (!this.keyDownHandlers.has(key)) {
            this.keyDownHandlers.set(key, new Set());
        }
        this.keyDownHandlers.get(key).add(f);
    }

    removeKeyDownHandler(key: KeyOrCode, f?: KeyboardEventHandler) {
        if (f == undefined) {
            this.keyDownHandlers.delete(key);
        } else {
            this.keyDownHandlers.get(key)?.delete(f);
        }
    }

    keyDownHandler(e: KeyboardEvent){
        if (this.keyDownHandlers.has(e.key)) {
            this.keyDownHandlers.get(e.key).forEach(f => f());
        }
    }

    addKeyUpHandler(key: KeyOrCode, f: KeyboardEventHandler) {
        if (!this.keyUpHandlers.has(key)) {
            this.keyUpHandlers.set(key, new Set());
        }
        this.keyUpHandlers.get(key).add(f);
    }

    removeKeyUpHandler(key: KeyOrCode, f?: KeyboardEventHandler) {
        if (f == undefined) {
            this.keyUpHandlers.delete(key);
        } else {
            this.keyUpHandlers.get(key)?.delete(f);
        }
    }

    keyUpHandler(e: KeyboardEvent){
        if (this.keyUpHandlers.has(e.key)) {
            this.keyUpHandlers.get(e.key).forEach(f => f());
        }
    }

    setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    setBackgroundColor(bgColor: string) {
        this.backgroundColor = bgColor;
    }

    addActor(actor: Actor) {
        this.actors.add(actor);
    }

    create() {}

    activate(){
        this.active = true;
    }
    
    update() {
        this.keysDown.forEach(k => {
            this.keyDownHandlers.get(k)?.forEach(h => h());
        });
        this.actors.forEach(actor => {
            actor.update();
        });
    }

    draw() {
        if (this.canvas == undefined || !this.active) return;

        let ctx = this.canvas.getContext("2d");
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, Game.WIDTH, Game.HEIGHT);

        this.actors.forEach(a => a.draw(ctx));

        return ctx;        
    }

    delete() {
        this.canvas = undefined;
        this.active = false;
    }
}

class IngameScene extends Scene {
    tanks: Tank[];
    turnIdx: number = 0;
    
    constructor(){
        super("ingame scene");
        this.setBackgroundColor("#000");
        this.tanks = new Array<Tank>();
    }

    addTanks(tankOptions: TankOption[]) {
        let margin = 50;
        let w = (Game.WIDTH-(2*margin)) / (tankOptions.length - 1);
        let tankX = margin;
        tankOptions.forEach(o => {
            let t = new Tank(o.color, {x: tankX, y: 10});
            t.alive = true;
            super.addActor(t);
            tankX += w;

            this.tanks.push(t);
        });

    }

    update(){
        super.update();
    }    

    nextTurn(){
        let prevTurnIdx = this.turnIdx;    
        do {
            this.turnIdx = (this.turnIdx + 1) % this.tanks.length;
            if (this.turnIdx == prevTurnIdx) throw new Error("All tanks are dead");
        } while(this.tanks[this.turnIdx].isDead);
    }

    get currentTank(): Tank {
        return this.tanks[this.turnIdx];
    }
}

interface IActor {
    update();
}

interface IDrawable {
    draw(ctx: CanvasRenderingContext2D);
}

type XY = {x: number, y: number};
type Position = XY;
class Vector {
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
class Circle { 
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

class Rectangle {
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

class Actor implements IActor,IDrawable {
    position: Position;
    velocity: Vector = new Vector(0,0);
    gravity: Vector = new Vector(0,0);
    
    constructor(position: Position = {x: 0, y: 0}){
        this.position = position;
    }

    get x() { return this.position.x }
    get y() { return this.position.y }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    draw(ctx: CanvasRenderingContext2D) {
    }
}

class SpriteActor extends Actor {
    image: HTMLImageElement;

    constructor(sprite: string, position: Position = {x:0, y:0}) {
        super(position);
        this.image = new HTMLImageElement();
        this.image.src = sprite;
    }

    draw(ctx: CanvasRenderingContext2D) {
        let width = this.image.width;
        let height = this.image.height;
        ctx.drawImage(this.image, this.x - width/2, this.y - height/2);
    }
}

class DrawActor extends Actor{
    constructor(position: Position = {x:0, y:0}) {
        super(position);
    }

    draw(ctx: CanvasRenderingContext2D){ }
}

type TankOption = {name:string, color:string};

class Tank extends Actor {
    color: string;
    size: number = 20;
    angle: number;
    power: number;
    alive: boolean;

    constructor(color: string, position: Position = {x:0, y:0}){
        super(position);
        this.color = color;
        this.gravity.y = 1;
        this.angle = 0;
    }

    get isDead() {return !this.alive;}    
    get isAlive() {return this.alive;}

    update(){
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
        }else if (this.x + this.velocity.x > Game.WIDTH) {
            this.velocity.x = 0;
            this.position.x = Game.WIDTH;
        } else {
            this.velocity.x += this.gravity.x;
        }
    }

    increaseAngle(amount: number = 1) {
        let angleInDegrees = Math.round(this.angle*180/Math.PI);
        angleInDegrees += amount;
        if (angleInDegrees < 0) angleInDegrees += 180;
        else if (angleInDegrees > 180) angleInDegrees -= 180;

        this.angle = angleInDegrees*Math.PI/180;
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
        ctx.lineWidth = this.size/3;
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.x, this.y - ctx.lineWidth/2);
        let toX = this.x + Math.cos(this.angle)*this.size*2;
        let toY = this.y - Math.sin(this.angle)*this.size*2 - ctx.lineWidth/2;
        ctx.lineTo(toX, toY);
        ctx.closePath();
        ctx.stroke();
    }
}

class Terrain extends Actor {
    static NODE_SIZE: number = 768;
    static MIN_NODE_SIZE: number = 4;

    node: TerrainNode;

    constructor(p: Position, size: number = Terrain.NODE_SIZE) {
        super(p)
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

class TerrainNode implements IDrawable {
    color: string = "green";
    position: Position;
    size: number;
    nodes: Set<TerrainNode> = new Set()
    isLeaf: boolean = true;

    constructor(p: Position, size: number) {
        this.position = p;
        this.position.x = Math.round(this.position.x);
        this.position.y = Math.round(this.position.y);
        this.size = Math.round(size);
        /* console.log(`constructor, ${p.x},${p.y}, size ${size}`); */
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
        if (this.size <= Terrain.MIN_NODE_SIZE) return;
        this.isLeaf = false;
        let sz = this.size/2;
        let newNodes = [
            new TerrainNode(this.position, sz),
            new TerrainNode({x: this.position.x + sz, y: this.position.y}, sz),
            new TerrainNode({x: this.position.x, y: this.position.y + sz}, sz),
            new TerrainNode({x: this.position.x + sz, y: this.position.y + sz}, sz)
        ];
        /* console.log("creating 4 new nodes: ");
        newNodes[0].print();
        newNodes[1].print();
        newNodes[2].print();
        newNodes[3].print(); */

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
        /* if (this.isLeaf || !inArea) {
            return inArea;
        }

        for (let n of this.nodes) {
            if (n.intersects(p)) return true;
        }
        return false; */
    }

    nodeAt(p: Position): TerrainNode {
        if (this.isLeaf) {
            if (this.intersects(p)) return this;
            return undefined;
        }
        for (let n of this.nodes) {
            if (n.intersects(p)) return n.nodeAt(p);
        }
    }

    countNodes(): number {
        if (this.isLeaf) return 1;
        let i = 0;
        for (let n of this.nodes) {
            i += n.countNodes();
        }
        return i;
    }

    get nw(): Position { return this.position; }
    get ne(): Position { return {x: this.position.x + this.size, y: this.position.y}; }
    get sw(): Position { return {x: this.position.x, y: this.position.y + this.size}; }
    get se(): Position { return {x: this.position.x + this.size, y: this.position.y + this.size}; }
    
    get rect(): Rectangle{
        return new Rectangle(this.position, this.size, this.size);
    }

    overlapsCircle(c: Circle): boolean {
        let p0 = {x: c.center.x, y: c.center.y};
        if (p0.x < this.nw.x) p0.x = this.nw.x;
        else if (p0.x > this.ne.x) p0.x = this.ne.x;
        if (p0.y < this.nw.y) p0.y = this.nw.y;
        else if (p0.y > this.sw.y) p0.y = this.sw.y;

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
        for (let n of this.nodes){ 
            if (n.overlapsCircle(c)) {
                n.color = "yellow";
                if (n.isInsideCircle(c) || n.size <= Terrain.MIN_NODE_SIZE){
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

let game = new Game();

let mainMenu = new Scene("main menu");
mainMenu.setBackgroundColor("#0000ff");

let optionsMenu = new Scene("options menu");
optionsMenu.setBackgroundColor("#00ff00");

let playersMenu = new Scene("players menu");
playersMenu.setBackgroundColor("#ff0000");

let ingameScene = new IngameScene();
ingameScene.addTanks(
    [
        { name:"Hubert", color:"red"}, 
        { name:"Martin", color:"blue"},
        { name:"Clarisse", color:"lime"}
    ]);
ingameScene.setBackgroundColor("black");
let terrain = new Terrain({x: 128, y: 128}, 512);
ingameScene.addActor(terrain);

game.activateScene(ingameScene);

ingameScene.addKeyDownHandler("ArrowUp", () => ingameScene.currentTank.power += 1);
ingameScene.addKeyDownHandler("ArrowDown", () => ingameScene.currentTank.power -= 1);
ingameScene.addKeyDownHandler("ArrowLeft", () => ingameScene.currentTank.increaseAngle());
ingameScene.addKeyDownHandler("ArrowRight", () => ingameScene.currentTank.decreaseAngle());
ingameScene.addKeyDownHandler("a", () => ingameScene.nextTurn());

document.addEventListener("mousemove", (ev) => {
    
    let mouseX = ev.offsetX;
    let mouseY = ev.offsetY;
    let p = {x: mouseX, y: mouseY};
    terrain.removeCircle(new Circle(p, 40));
    return;
    let node = terrain.nodeAt(p);
    if (node == undefined) {
        console.log(`nothing at ${mouseX}, ${mouseY}`);
    } else {
        console.log(`button: ${ev.button}`);
        if (ev.button == 0) {
            console.log("subdividing");
            node.subdivide();
        } else if (ev.button == 1) {
            console.log("deleting circle");
            terrain.removeCircle(new Circle(p, 40));
        }
    }
});

function generateTerrain(): Terrain {
    let t = new Terrain({x: 0, y:0});
    return t;
}
