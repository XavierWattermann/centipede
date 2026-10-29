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

        //  Bug constructor: (name, x, y, speed, radius, health, color, points)
        super(
            "Flea",
            pos.x,
            1.05,                   // Start above the screen
            0.018,                   // Speed
            0.03,                   // Radius
            2,                      // takes 2 hits
            [0.9, 0.2, 0.9, 1.0],   // Magenta color
            100                     //points
        );
    }

    // Flea moves straight down
    update() {
        this.y -= this.speed;
        // ~2% chance per frame while in the play area (not off-screen or on bottom edge)
        if (Math.random() < 0.02 && this.y < 0.85 && this.y > -0.80) {
            mushrooms.push({
                x: this.x,
                y: this.y,
                health: 4,
                row: Math.floor((this.y + 1.0) * 15) // Keeps player-zone spawn check working
            });
        }
    }
}

class Spider extends Bug {
    constructor() {
        var column = 10;
        var pos = gridToClip(column, 0);

        var spawnLeft = Math.random() < 0.5;
        var startX = spawnLeft ? -1.05 : 1.05;
        var initialDirX = spawnLeft ? 1.0 : -1.0;

        //  Bug constructor: (name, x, y, speed, radius, health, color, points)
        super(
            "Spider",
            startX,
            -0.75,                   // Starts in the player zone
            0.02,                   // Speed
            0.05,                   // Radius
            1,                      // Health (takes 1 hit)
            [0.5, 0.5, 0.2, 1.0],   // Olive/yellow color
            200 // TODO: spider points should be based on where they get hit but ehhhhh
        );
        this.dirX = initialDirX;
        this.dirY = Math.random() < 0.5 ? 1.0 : -1.0; // Randomly starts moving up or down
        this.speedX = 0.007; // Steady horizontal crawl
        this.speedY = 0.018; // Fast vertical zigzag
        // Vertical boundary limits (player area: bottom -0.95 to ceiling -0.60)
        this.minY = -0.95;
        this.maxY = -0.60;
        this.changeTimer = Math.floor(Math.random() * 30) + 20; 
    }

    // Spider movement 
    // TODO: need to make this erratic
    update() {
        this.x += this.speedX * this.dirX;
        this.y += this.speedY * this.dirY;
        // Bounce off the bottom and top boundaries of the player zone
        if (this.y <= this.minY) {
            this.y = this.minY;
            this.dirY = 1.0; // Bounce up
        } else if (this.y >= this.maxY) {
            this.y = this.maxY;
            this.dirY = -1.0; // Bounce down
        }
        // Random mid-air direction change
        this.changeTimer--;
        if (this.changeTimer <= 0) {
            // Flip vertical direction or pause briefly
            this.dirY = -this.dirY;
            // Reset timer to pick another random interval (20 to 60 frames)
            this.changeTimer = Math.floor(Math.random() * 40) + 20;
        }
    }
}


class Scorpion extends Bug {
    constructor() {
        var column = 20;//Math.floor(Math.random() * 30);
        var pos = gridToClip(column, 29);
        console.log("scorp", column, pos)
        //  Bug constructor: (name, x, y, speed, radius, health, color, points)
        super(
            "Scorpion",
            0.9,
            0.8,                   
            0.02,                   // Speed
            0.03,                   // Radius
            1,                     
            [0.0, 0.1, 0.1, 1.0],   // TODO: change colorl
            1000                    //points
        );
    }

    // Scorpion moves across 
    update() {
        this.x -= this.speed;
    }
}

// CentipedeSegment is 1/12 that makes up the Centipede grouped object 
class CentipedeSegment extends Bug {
    constructor(col, row, isHead, dirX) {
        // var column = 20;//Math.floor(Math.random() * 30);
        var pos = gridToClip(col, row);
        //  Bug constructor: (name, x, y, speed, radius, health, color, points)
        var segmentColor = isHead ? [1.0, 1.0, 0.0, 1.0] : [0.0, 1.0, 0.0, 1.0]

        super(
            isHead ? "CentipedeHead" : "CentipedeBody", //Name
            pos.x,
            pos.y,
            // 0.05,                   // Speed
            0.02,                   // Speed
            0.03,                   // Radius
            1,                     
            segmentColor,   // TODO: change colorl
            100                    //points
        );
        this.col = col; 
        this.row = row;
        this.isHead = isHead;
        this.dirX = dirX;
        this.dirY = -1;
        this.minX = -0.97;
        this.maxX = 0.97;
        this.dropDistance = 0.067; // Exactly 1 row height (2.0 / 30 rows)


    }
    update(mushrooms) {
        // 1. Check Left & Right Wall Collision
        var hitWall = false;
        if (this.dirX === 1 && this.x >= this.maxX) {
            this.x = this.maxX;
            hitWall = true;
        } else if (this.dirX === -1 && this.x <= this.minX) {
            this.x = this.minX;
            hitWall = true;
        }

        if (hitWall) {
            // Drop down 1 row and turn around
            this.y += this.dropDistance * this.dirY;
            this.dirX = -this.dirX;
        } else {
            // 2. Check Mushroom Collision (Look-ahead)
            var nextX = this.x + (this.speed * this.dirX);
            var hitMushroom = false;

            if (mushrooms) {
                for (var m = 0; m < mushrooms.length; m++) {
                    // Only check mushrooms sharing the same row (similar Y coordinate)
                    if (Math.abs(this.y - mushrooms[m].y) < this.dropDistance * 0.6) {
                        // Check if the next step overlaps this mushroom
                        if (checkCollision(nextX, this.y, this.radius, mushrooms[m].x, mushrooms[m].y, this.radius)) {
                            hitMushroom = true;
                            break;
                        }
                    }
                }
            }

            if (hitMushroom) {
                // Hit mushroom: Drop down 1 row and turn around (just like a wall!)
                this.y += this.dropDistance * this.dirY;
                this.dirX = -this.dirX;
                this.x += this.speed * this.dirX; // Step forward in the new direction
            } else {
                // Clear path: Normal movement
                this.x = nextX;
            }
        }

        // 3. Floor boundary (Player zone): If it reaches bottom, start climbing up
        if (this.y <= -0.95) {
            this.y = -0.95;
            this.dirY = 1; // Move up on future turns
        } else if (this.y >= -0.60 && this.dirY === 1) {
            this.dirY = -1; // If it climbed to top of player area, head back down
        }
    }
}

class Centipede {
    constructor(length = 12, startCol = 15, startRow = 29, dirX = 1){
        this.segments = [];

        for (var i = 0; i < length; i++){
            var isHead = (i === 0); 
            var col = startCol - (i * dirX);
            var row = startRow;
            this.segments.push(new CentipedeSegment(col, row, isHead, dirX));
        }
    }
    update() {
        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].update(mushrooms);
        }
    }
    draw() {
        // helper function to make the segments 
        for (var i = 0 ; i < this.segments.length; i++){
            var seg = this.segments[i];
            drawSingleOctagon(seg.x, seg.y, 0.0, seg.color); // todo change the shape
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkCollision, checkCollisions, Bug, Flea, Spider, Scorpion, Centipede, CentipedeSegment };
}