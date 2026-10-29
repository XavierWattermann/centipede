// Xavier Wattermann
// Project 1   

var gl;
var shaderProgramSquare;
var thetaJS;
var thetaUniform;

var stopStartFlag = 1.0;

var moveX_JS;
var moveY_JS;
var moveUniform;
var colorUniform;
var speed = 0.01; //TODO: give these a more descriptive name (user speed, enemy speed)
var rotateSpeed = 0.02;
var directionX = 1.0;
var directionY = 0.0;
// boundaries to limit where we can move
var playerRadius = 0.03;
var mushroomRadius = 0.03; 
var bulletRadius = 0.01; 
var minX = -1.0 + playerRadius; //left
var maxX = 1.0 - playerRadius; //right
var minY = -1.0 + playerRadius; //bottom wall
var maxY = -0.60 - playerRadius; //top the player can go TODO: ADJUST THIS

var bugs = []; //array to hold all of the different types of bugs

var isPaused = false;
var isGameOver = false;
var wPressed = false;
var aPressed = false;
var sPressed = false;
var dPressed = false;
var spacePressed = false;
var shootCooldown = 0;

var playerBufferId; // this is for the player character
var octagonBufferId; // mushrooms & centipede 
var spiderBufferId; // for spider
var bulletBufferId;
var mushroomBufferId; // Separate buffer for mushroom caps
var myPositionAttribute; //need to refactor this
var bullets = []
var bulletSpeed = 0.04;

var mushrooms = [];
var centipedes = []

var spiderSpawnTimer = 300;
var fleaSpawnTimer = 600;
var scorpionSpawnTimer = 900;

var score = 0;
var lives = 3;

// size of the clipspace / canvas 
var COLS = 30;
var ROWS = 30;
var cellWidth = 2.0 / COLS;
var cellHeight = 2.0 / ROWS;


function hasBug(bugName){
    for (var i = 0; i <bugs.length; i++){
        if (bugs[i].name === bugName){
            return true;
        }
    }
    return false;
}

function handleBugSpawning(){
    // make sure 1 centipede is always active on the screen
    if (centipedes.length === 0){
        centipedes.push(new Centipede(12));
    }

    if (!hasBug("Spider")){
        spiderSpawnTimer--;
        if (spiderSpawnTimer <= 0){
            spawnBug("Spider");

            spiderSpawnTimer = Math.floor(Math.random() * 240) + 360;
        }
    }

    var mushroomsInPlayerZone = mushrooms.filter(function(m) { return m.row <= 5; }).length;
    if (mushroomsInPlayerZone < 5 && !hasBug("Flea")) {
        fleaSpawnTimer--;
        if (fleaSpawnTimer <= 0) {
            spawnBug("Flea");
            fleaSpawnTimer = 300; // 5 second retry if still under threshold
        }
    }

    if (!hasBug("Scorpion")) {
        scorpionSpawnTimer--;
        if (scorpionSpawnTimer <= 0) {
            spawnBug("Scorpion");
            scorpionSpawnTimer = Math.floor(Math.random() * 600) + 900;
        }
    }


}

function addScore(amount) {
    score += amount;
    document.getElementById("scoreDisplay").textContent = score;
}

function removeLife() {
    lives -= 1;
    if (lives <= 0){
        lives = 0; // make it so lives can't go negative
    }
    document.getElementById("livesDisplay").textContent = lives;
}

function updateDisplay(message) {
    // helper function to update the game display -- gives the user updates about their status
    document.getElementById("updateDisplay").textContent = message;
}

function resetPlayerLife() {
    removeLife();

    if (lives <= 0) {
        // TODO: -> need a better way to display this
        console.log("GAME OVER");
        var message = "";
        if (score >= 5000){
            message = "You scored over 5000 points, you win!"
        }
        else{
            message = "Game Over! -- Refresh the page to restart";
        }

        updateDisplay(message)
        isPaused = true;
        isGameOver = true;
        return;
    }

    updateDisplay("Lost a life! Press a key to resume");
    isPaused = true;

    moveX_JS = 0.0;
    moveY_JS = -0.8;

    bugs = [];
    bullets = [];
    centipedes = [];

    wPressed = false;
    aPressed = false;
    sPressed = false;
    dPressed = false;
    spacePressed = false;

    // reset mushrooms?
    // for (var m = 0; m < mushrooms.length; m++) {
    //     mushrooms[m].health = 4;
    // }
}


// Maps grid (col, row) to WebGL clip space center coordinates (x, y)
function gridToClip(col, row) {
    return {
        x: -1.0 + (col + 0.5) * cellWidth,
        y: -1.0 + (row + 0.5) * cellHeight
    };
}


function spawnBug(bugName){
    var bug;
    var renderBug = true;

    if(bugName === 'Flea'){
        bug = new Flea();
    }
    else if (bugName === 'Spider'){
        bug = new Spider();
    }
    else if (bugName === 'Scorpion'){
        bug = new Scorpion();
    }
    else if (bugName === 'Centipede'){
        renderBug = false;
        centipedes.push(new Centipede(12));
    }

    if (renderBug){
        bugs.push(bug)
    }


}

function handleShooting(){
        // Fire if spacebar is held and cooldown has reset
    if (shootCooldown > 0) {
        shootCooldown--;
    }
    if (spacePressed && shootCooldown === 0) {
        bullets.push({
            x: moveX_JS,
            y: moveY_JS
        });
        // lower number == faster fire rate; TODO: make this param
        shootCooldown = 7; 
    }
}


function createMushrooms() {
    var TARGET_NUMBER = 45; 

    var occupied = {};

    var attempts = 0;
    // Keep generating random mushrooms until we reach TARGET_NUMBER
    while (mushrooms.length < TARGET_NUMBER && attempts < 5000) {
        attempts++;

        var c = Math.floor(Math.random() * COLS);
        // Rows 6 to 28 (keeps bottom 1/5th clear for the player)
        var r = Math.floor(Math.random() * (ROWS - 7)) + 6;

        var key = c + "," + r;
        if (!occupied[key]) {
            occupied[key] = true;
            var clipPos = gridToClip(c, r);

            mushrooms.push({
                col: c,
                row: r,
                x: clipPos.x,
                y: clipPos.y,
                health: 4
            });
        }
    }

    // Buffer the octagon geometry once onto the GPU
    setupOctagon();
}

function setupMushroomCap() {
    var points = [vec2(0.0, -0.015)]; // Center anchor at bottom-middle
    var r = 0.03;
    var steps = 8;
    // Arch over the top from 0 to PI (180 degrees)
    for (var i = 0; i <= steps; i++) {
        var angle = i * (Math.PI / steps);
        var x = r * Math.cos(angle);
        var y = -0.015 + (r * 1.25) * Math.sin(angle); // Dome curve
        points.push(vec2(x, y));
    }
    mushroomBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mushroomBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function drawMushroomCap(x, y, theta, color) {
    color = color || [0.0, 1.0, 0.0, 1.0];

    gl.bindBuffer(gl.ARRAY_BUFFER, mushroomBufferId);
    gl.vertexAttribPointer(myPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(moveUniform, x, y);
    gl.uniform1f(thetaUniform, theta);
    gl.uniform4fv(colorUniform, color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 10);
}

function drawSingleOctagon(x, y, theta, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, octagonBufferId);
    gl.vertexAttribPointer(myPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(moveUniform, x, y);
    gl.uniform1f(thetaUniform, theta);
    gl.uniform4fv(colorUniform, color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);
}
function drawSingleBullet(x, y) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletBufferId);
    gl.vertexAttribPointer(myPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(moveUniform, x, y);
    gl.uniform1f(thetaUniform, 0.0); // Bullets travel straight vertical
    gl.uniform4f(colorUniform, 0.7, 0.7, 0.7, 1.0); // Gray 
    gl.drawArrays(gl.LINES, 0, 2);
}

function mushroomHealthColor(health) {
    // function to return the color of the mushroom based on it's health (how many hits it has)
    // default (4) is green, 3 is yellow, 2 is orange, 1 is red, and 0 means it should be removed from the screen
    // returns an array of the color to use
    var healthy  = [0.0, 1.0, 0.0, 1.0]; // Pure Green
    var oneHit   = [1.0, 1.0, 0.0, 1.0]; // Pure Yellow
    var twoHit   = [1.0, 0.5, 0.0, 1.0]; // Orange (full red, half green)
    var threeHit = [1.0, 0.0, 0.0, 1.0]; // Pure Red
    if (health === 4 ) {
        return healthy;
    }
    else if (health === 3){
        return oneHit;
    }
    else if (health === 2){
        return twoHit;
    }
    else if (health === 1){
        return threeHit;
    }
    return healthy;
}

function fleaHealthColor(health) {
    var healthy = [0.9, 0.2, 0.9, 1.0];
    // var oneHit = [0.8, 0.2, 0.8, 1.0];
    var oneHit = [1.0, 1.0, 1.0, 1.0];
    if (health === 2 ) {
        return healthy;
    }
    else if (health === 1){
        return oneHit;
    }
    return healthy;
}

function bugPlayerCollisionCheck(bug){
    // Checks if the player has collided with any bug -- resulting in losing a life
    if (checkCollision(moveX_JS, moveY_JS, playerRadius, bug.x, bug.y, bug.radius)){
        return true;
    }
}

function mushroomRendering(){
    for (var i = 0; i < mushrooms.length; i++) {
        var mushroomColor = mushroomHealthColor(mushrooms[i].health);
        // drawSingleOctagon(mushrooms[i].x, mushrooms[i].y, 0.0, mushroomColor);
        drawMushroomCap(mushrooms[i].x, mushrooms[i].y, 0.0, mushroomColor);
    }
}

function bugRendering(){
    // handles bug and centipede rendering
    for (var i = 0; i < bugs.length; i++) {
        var bug = bugs[i];

        bug.update();

        // player collision check
        if (bugPlayerCollisionCheck(bug)){
            resetPlayerLife();
            return; // exit early 
        }

        if (bug.isOffScreen()) {
            bugs.splice(i, 1);
            i--;
            continue;
        }

        if (bug.name === "Flea"){
            var bugColor = fleaHealthColor(bug.health)
            drawSingleOctagon(bug.x, bug.y, 0.0, bugColor);
        }
        else if (bug.name === "Spider"){
            var bugColor = [0.5, 0.5, 0.2, 1.0];
            drawSpiderTrapezoid(bug.x, bug.y, 0.0,[0.9, 0.6, 0.1, 1.0]); 
        }
        else if (bug.name === "Scorpion"){
            var bugColor = [0.5, 0.5, 0.2, 1.0];
            drawSingleOctagon(bug.x, bug.y, 0.0, bugColor);
        }

    }

    // CENTIPEDE RENDERING
    for (var c = 0; c < centipedes.length; c++){
        var centipede = centipedes[c];
        centipede.update(mushrooms);
        centipede.draw();

        for (var s = 0; s < centipede.segments.length; s++) {
            if (bugPlayerCollisionCheck(centipede.segments[s])) {
                resetPlayerLife();
                return; 
            }
        }
    }



}

function mushroomCollisionCheck(){
    // COLLISION CHECK WITH MUSHROOM; user shouldn't be able to clip through mushrooms
    directionX = aPressed ? -1.0 : (dPressed ? 1.0 : 0.0);
    directionY = wPressed ? 1.0 : (sPressed ? -1.0 : 0.0);

    var nextX = moveX_JS + (speed * directionX);
    var nextY = moveY_JS + (speed * directionY);

    nextX = Math.max(minX, Math.min(maxX, nextX));
    nextY = Math.max(minY, Math.min(maxY, nextY));
    var blocked = false;
    for (var i = 0; i <mushrooms.length; i++){
        if (checkCollision(nextX, nextY, playerRadius, mushrooms[i].x, mushrooms[i].y, mushroomRadius)) {
            // console.log("MUSHROOM COLLISION");
            blocked = true;
            break;
        }
    }

    // can only move if we don't have a mushroom collision
    if (!blocked) {
        moveX_JS = nextX;
        moveY_JS = nextY;
    }
}

function bulletCollisionCheck(){
 // BULLET COLLISION CHECK -- start 
    for (var bullet = 0; bullet < bullets.length; bullet++) {
        bullets[bullet].y += bulletSpeed;
        var hitTarget = false;
        // Check collisions against mushrooms
        for (var mushroom = 0; mushroom < mushrooms.length; mushroom++) {
            if (checkCollision(bullets[bullet].x, bullets[bullet].y, bulletRadius, mushrooms[mushroom].x, mushrooms[mushroom].y, mushroomRadius)) {
                mushrooms[mushroom].health--;
                if (mushrooms[mushroom].health <= 0) {
                    mushrooms.splice(mushroom, 1);
                    addScore(10);
                }
                hitTarget = true;
                break;
            }
        }
        // Check collisions against bugs (only if bullet hasn't already hit a mushroom)
        if (!hitTarget) {
            for (var b = 0; b < bugs.length; b++) {
                if (checkCollision(bullets[bullet].x, bullets[bullet].y, bulletRadius, bugs[b].x, bugs[b].y, bugs[b].radius)) {
                    bugs[b].takeDamage(1);
                    if (bugs[b].isDead()) {
                        addScore(bugs[b].points);
                        bugs.splice(b, 1); // Remove the dead bug
                        // addScore(100);
                    }
                    hitTarget = true;
                    break; // Stop checking other bugs for this bullet
                }
            }
        }
        // check collision against centipede (need different logic compared to bugs above)
        // console.log(centipedes
        if (!hitTarget) {
            for (var c = 0; c < centipedes.length; c++) {
                var centipede = centipedes[c];
                for (var s = 0; s < centipede.segments.length; s++) {
                    var seg = centipede.segments[s];
                    if (checkCollision(bullets[bullet].x, bullets[bullet].y, bulletRadius, seg.x, seg.y, seg.radius)) {
                        console.log("Bullet collision with centipede segment", s);
                        // destroyed centipede -> new mushroom
                        mushrooms.push({
                            col: seg.col,
                            row: seg.row,
                            x: seg.x,
                            y: seg.y,
                            health: 4
                        });
                        centipede.segments.splice(s, 1);
                        if (centipede.segments.length === 0) {
                            // todo -- do we still need this?
                            centipedes.push(new Centipede(12));
                            // centipedes.splice(c, 1);
                            // c--;
                            addScore(100);
                        }
                        hitTarget = true;
                        break; // Stop checking other segments for this bullet
                    }
                }
                if (hitTarget) {
                    break; // Stop checking other centipedes for this bullet
                }
            }
        }

        // Remove bullet if it hit anything or left the screen
        if (hitTarget || bullets[bullet].y > 1.0) {
            bullets.splice(bullet, 1);
            bullet--;
            continue;
        }
        // draw the bullet
        drawSingleBullet(bullets[bullet].x, bullets[bullet].y);
    } //BULLET COLLISION CHECK -- end 
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    mushroomRendering();
    drawPlayerTriangle(moveX_JS, moveY_JS, 0.0, [0.0, 1.0, 1.0, 1.0]);

    if (isPaused || isGameOver) {
        // updateDisplay("Lost a life! Game is paused; move a key to resume ")
        requestAnimFrame(render);
        return;
    }

    handleShooting();
    bulletCollisionCheck();
    bugRendering();
    mushroomCollisionCheck();
    handleBugSpawning();
    requestAnimFrame(render);
}

function changeSpeed(increase) {
    var inc = 0.01;
    if (increase) {
        speed += inc;
    } else {
        // make sure it doesn't go negative
        if (speed <= 0.0) {
            speed = 0.0;
        }
        else{
            speed -= inc 
        }
    }
    // console.log("Speed is, ", speed);
    document.getElementById("speedDisplay").textContent = speed.toFixed(2);
}

function changeRotateSpeed(increase) {
    // Change the rotation speed; basically the same function
    // as the above changeSpeed, and could probably refactor it to handle both
    var inc = 0.01;
    if (increase) {
        rotateSpeed += inc;
    } else {
        // make sure it doesn't go negative
        if (rotateSpeed <= 0.0) {
            rotateSpeed = 0.0;
        }
        else{
            rotateSpeed -= inc 
        }
    }
    document.getElementById("rotateSpeedDisplay").textContent = rotateSpeed.toFixed(2);
}


function init() {
    // Set up the canvas
    var canvas=document.getElementById("gl-canvas");
    gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    // Set up the viewport
    gl.viewport( 0, 0, 512, 512 );   // x, y, width, height
    
    
    // Set up the background color
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    
    shaderProgramSquare = initShaders( gl, "vertex-shader-square",
                                      "fragment-shader-square" );
    gl.useProgram( shaderProgramSquare );
    thetaJS = 0.0;
    thetaUniform = gl.getUniformLocation(shaderProgramSquare, "theta");
    gl.uniform1f(thetaUniform, thetaJS);
    stopStartFlag = 1.0;

    moveX_JS = 0.0;
    moveY_JS = 0.0;
    moveUniform = gl.getUniformLocation(shaderProgramSquare, "move");
    colorUniform = gl.getUniformLocation(shaderProgramSquare, "uColor");
    gl.uniform2f(moveUniform, moveX_JS, moveY_JS);

    // Force the WebGL context to clear the color buffer
    gl.clear( gl.COLOR_BUFFER_BIT );

    spawnBug('Flea');
    spawnBug('Spider');

    centipedes.push(new Centipede(12));
    createMushrooms();
    setupBullet();
    setupMushroomCap();
    setupPlayerTriangle();
    setupSpiderTrapezoid();
    render();

}


function setupBullet() {
    var lineLength = 0.04; //todo: should make this controllable   
    var linePoints = [
        vec2(0.0, 0.0),
        vec2(0.0, lineLength)
    ];
    bulletBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bulletBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(linePoints), gl.STATIC_DRAW);
}

function setupPlayerTriangle() {
    var r = playerRadius; // 0.03
    var trianglePoints = [
        vec2(0.0, r),      
        vec2(-r, -r),      
        vec2(r, -r)        
    ];
    playerBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, playerBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trianglePoints), gl.STATIC_DRAW);
}

function drawPlayerTriangle(x, y, theta, color) {
    color = color || [0.0, 1.0, 1.0, 1.0]; // Default cyan/blue
    gl.bindBuffer(gl.ARRAY_BUFFER, playerBufferId);
    gl.vertexAttribPointer(myPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(moveUniform, x, y);
    gl.uniform1f(thetaUniform, theta);
    gl.uniform4fv(colorUniform, color);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawSpiderTrapezoid(x, y, theta, color) {
    color = color || [0.9, 0.6, 0.1, 1.0]; // Default spider color
    gl.bindBuffer(gl.ARRAY_BUFFER, spiderBufferId);
    gl.vertexAttribPointer(myPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(moveUniform, x, y);
    gl.uniform1f(thetaUniform, theta);
    gl.uniform4fv(colorUniform, color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function setupSpiderTrapezoid() {
    var trapezoidPoints = [
        vec2(-0.025,  0.03), // Top-left
        vec2(-0.045, -0.03), // Bottom-left
        vec2( 0.045, -0.03), // Bottom-right
        vec2( 0.025,  0.03)  // Top-right
    ];

    spiderBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spiderBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(trapezoidPoints), gl.STATIC_DRAW);
}

function setupOctagon() {
    var arrayOfPoints = [];
    var cx = 0.0;
    var cy = 0.0;
    var r = 0.03;
    var sides = 8;

    for (var i = 0; i < sides; i++) {
        var angle = i * (2.0 * Math.PI / sides);
        var x = cx + r * Math.cos(angle);
        var y = cy + r * Math.sin(angle);
        arrayOfPoints.push(vec2(x, y));
    }

    octagonBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, octagonBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(arrayOfPoints), gl.STATIC_DRAW);

    myPositionAttribute = gl.getAttribLocation(shaderProgramSquare, "myPosition");
    gl.enableVertexAttribArray(myPositionAttribute);

}

function drawOctagon() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    moveX_JS += (speed * directionX);
    moveY_JS += (speed * directionY);
    gl.uniform2f(moveUniform, moveX_JS, moveY_JS);

    thetaJS += (rotateSpeed * stopStartFlag);
    gl.uniform1f(thetaUniform, thetaJS);


    gl.drawArrays( gl.TRIANGLE_FAN, 0, 8 );
    requestAnimFrame( drawOctagon);
}



function moveOctagon(event){
    console.log("Currently not doing anything with mouse clicks");

}


function movePlayer(event, keyDirection){

    if (isGameOver) {
        return;
    }

    if (isPaused) {
        if (keyDirection === 'down') {
            isPaused = false;
            updateDisplay("");
        }
        return;
    }
    var theKeyCode = event.keyCode;

    // MOVEMENT =================================================
    if (theKeyCode == 65 || theKeyCode == 37){ // a key || left arrow
        aPressed = true ? keyDirection === 'down' : false;
    }
    else if (theKeyCode == 68 || theKeyCode == 39){ // d key || right arrow
        dPressed = true ? keyDirection === 'down' : false;
    }
    else if (theKeyCode == 83 || theKeyCode == 40){ // s key || down
        sPressed = true ? keyDirection === 'down' : false;
    }
    else if (theKeyCode == 87 || theKeyCode == 38){ // w key || up
        wPressed = true ? keyDirection === 'down' : false;
    }
    // ==============================================================
    // SPACE BAR -- SHOOTING
    if (theKeyCode == 32) {
        event.preventDefault(); //handles to stop the page scrollign 
        spacePressed = (keyDirection === 'down');
        // bullets.push({
        //     x: moveX_JS,
        //     // y: moveY_JS + playerRadius 
        //     y: moveY_JS 
        // });
    }

    
    gl.uniform2f(moveUniform, moveX_JS, moveY_JS);
}
