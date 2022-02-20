import {Game} from './lib/Game.js';
import {Circle, Vector, Rectangle} from './lib/Trigonometry.js';
import {Scene} from './lib/Scene.js';

import { IngameScene } from './IngameScene.js';
import { Terrain } from './Terrain.js';

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

ingameScene.addKeyPressedHandler("ArrowUp", () => ingameScene.currentTank.power += 1);
ingameScene.addKeyPressedHandler("ArrowDown", () => ingameScene.currentTank.power -= 1);
ingameScene.addKeyPressedHandler("ArrowLeft", () => ingameScene.currentTank.increaseAngle());
ingameScene.addKeyPressedHandler("ArrowRight", () => ingameScene.currentTank.decreaseAngle());
ingameScene.addKeyDownHandler("a", () => ingameScene.nextTurn());
ingameScene.addKeyUpHandler("b", () => console.log("Draw time:", ingameScene.debugTime));

ingameScene.addKeyDownHandler("c", () => console.log("c down"));
ingameScene.addKeyPressedHandler("c", () => console.log("c pressed"));
ingameScene.addKeyUpHandler("c", () => console.log("c up"));


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
