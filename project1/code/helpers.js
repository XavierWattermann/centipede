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


class Flea {
  constructor() {
    // var column = 15; //TODO -> make this random
    var column = Math.floor(Math.random() * 30);
    var pos = gridToClip(column, 29);

    this.name = "Flea"; // just a identifier although this should be OOP
    this.x = pos.x;
    this.y = 1.05; //above the screen
    this.speed = 0.01; // TODO; adjust this
    this.radius = 0.03;
    this.health = 2; // in centipede it takes 2 hits to kill this
    this.color = [0.9, 0.2, 0.9, 1.0]; // TODO: have this change / range of values
    // this.name = name;
    // this.health = health;
    // this.attackPower = attackPower;
  }

  update(){
    this.y -= this.speed; //drops down
  }

  takeDamage(amount){
    this.health -= amount;
  }

  isDead(){
    return this.health <= 0;
  }

  isOffScreen() {
    return this.y < -1.1;
  }


}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkCollision, checkCollisions };
}