// helper functions that are used in project1.js


function checkCollision(x1, y1, r1, x2, y2, r2) {
    // checks collisions 
    // source -> https://stackoverflow.com/questions/8331243/circle-collision-in-javascript
    var dx = x2 - x1;
    var dy = y2 - y1;
    var distSq = dx * dx + dy * dy;
    var radiusSum = r1 + r2;
    return distSq < (radiusSum * radiusSum);
}

var checkCollisions = checkCollision;


// Base Bug class with shared attributes and behaviors
class Bug {
    constructor(name, x, y, speed, radius, health, color, points) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.radius = radius;
        this.health = health;
        this.color = color;
        this.points = points; // how many points killing the bug is worth
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`${this.name} took ${amount} damage. HP: ${this.health}`);
    }

    isDead() {
        return this.health <= 0;
    }

    isOffScreen() {
        // Off bottom, top, left, or right
        return this.y < -1.1 || this.y > 1.1 || this.x < -1.1 || this.x > 1.1;
    }

    update() {
        // Default update (child classes override this for their unique movement)
        // pass wait pass is python -- guess you can just have an empty func in javascript?
    }
}

class Flea extends Bug {
    constructor() {
        var column = Math.floor(Math.random() * 30);
        var pos = gridToClip(column, 29);

        // Call parent Bug constructor: (name, x, y, speed, radius, health, color)
        super(
            "Flea",
            pos.x,
            1.05,                   // Start above the screen
            0.01,                   // Speed
            0.03,                   // Radius
            2,                      // takes 2 hits
            [0.9, 0.2, 0.9, 1.0],   // Magenta color
            100                     //points
        );
    }

    // Flea moves straight down
    update() {
        this.y -= this.speed;
    }
}

class Spider extends Bug {
    constructor() {
        var column = 10;
        var pos = gridToClip(column, 0);

        // Call parent Bug constructor: (name, x, y, speed, radius, health, color)
        super(
            "Spider",
            pos.x,
            -0.7,                   // Starts in the player zone
            0.02,                   // Speed
            0.05,                   // Radius
            1,                      // Health (takes 1 hit)
            [0.5, 0.5, 0.2, 1.0],   // Olive/yellow color
            200 // TODO: spider points should be based on where they get hit but ehhhhh
        );
    }

    // Spider movement (e.g. zigzag, or custom pattern)
    update() {
        this.y -= this.speed;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkCollision, checkCollisions, Bug, Flea, Spider };
}