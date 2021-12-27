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
    
    constructor(name: string){
        this.name = name;
        this.actors = new Set<Actor>();
        this.active = false;
        this.paused = false;
        this.backgroundColor = "#000";
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
}

interface IActor {
    update();
}

interface IDrawable {
    draw(ctx: CanvasRenderingContext2D);
}

type XY = {x: number, y: number};
type Position = XY;
type Vector = XY;

class Actor implements IActor,IDrawable {
    position: Position;
    velocity: Vector = {x: 0, y: 0};
    gravity: Vector = {x: 0, y: 0};
    
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
        
        this.increaseAngle();        
    }

    increaseAngle() {
        this.angle = (this.angle + 0.01) % Math.PI;
    }

    decreaseAngle() {
        this.angle = (this.angle - 0.01) % Math.PI;
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
        { name:"Clarisse", color:"green"}
    ]);
ingameScene.setBackgroundColor("black");

game.activateScene(ingameScene);
