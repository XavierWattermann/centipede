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

// Optional alias in case plural checkCollisions is used
var checkCollisions = checkCollision;

// Export for CommonJS/Node environments if present without breaking browsers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkCollision, checkCollisions };
}