// ============================================================
//  GROEN & GEWOON DOEN — js/grass.js
//  P5.js gras-animatie (achtergrond)
// ============================================================

let grass = [];
let animationId;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    const c = document.querySelector('canvas');
    if (!c) return;
    c.style.cssText = 'position:fixed;top:0;left:0;z-index:-1;';
    for (let i = 0; i < 20; i++) grass.push(new Grass(random(width)));
}

function draw() {
    background(255);
    for (const g of grass) { g.show(); g.update(); }
    if (grass.length < 50) grass.push(new Grass(random(width)));
}

class Grass {
    constructor(x) {
        this.pos   = createVector(x, random(-30, 0));
        this.vel   = createVector(0, random(7, 10));
        this.len   = random(15, 30);
        this.color = color(34, 139, 34);
    }
    show()   { stroke(this.color); strokeWeight(2); line(this.pos.x, this.pos.y, this.pos.x, this.pos.y - this.len); }
    update() { this.pos.add(this.vel); if (this.pos.y > height + 100) grass.shift(); }
}

function fly() {
    const elem = document.getElementById('spitfire');
    if (!elem) return;
    elem.style.position = 'absolute';
    let angle = 0;
    const cx = window.innerWidth / 2 - 50, cy = window.innerHeight / 2 - 50;
    if (animationId) cancelAnimationFrame(animationId);
    function animate() {
        if (angle >= 8 * Math.PI) { elem.style.cssText = ''; return; }
        angle += 0.05;
        elem.style.left = (cx + 200 * Math.sin(angle))     + 'px';
        elem.style.top  = (cy + 100 * Math.sin(2 * angle)) + 'px';
        animationId = requestAnimationFrame(animate);
    }
    animate();
}
