// Xavier Wattermann
// Project 1   

// Note: checkCollision is loaded from helpers.js in project1.html



console.log(checkCollision(1,1,1,1,1,1));

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


var octagonBufferId; 
var bulletBufferId;
var myPositionAttribute; //need to refactor this
var bullets = []
var bulletSpeed = 0.04;

var mushrooms = [];

// size of the clipspace / canvas 
var COLS = 30;
var ROWS = 30;
var cellWidth = 2.0 / COLS;
var cellHeight = 2.0 / ROWS;
// Maps grid (col, row) to WebGL clip space center coordinates (x, y)
function gridToClip(col, row) {
    return {
        x: -1.0 + (col + 0.5) * cellWidth,
        y: -1.0 + (row + 0.5) * cellHeight
    };
}


function createMushrooms() {
    // TODO: need to limit this to 1/5 of the bottom area
    mushrooms = [];
    var occupied = {}; // Prevents placing two mushrooms in the same cell

    for (var r = 1; r < ROWS - 1; r++) {
        var count = 1;

        if (r <= 3) {
            // Bottom 2-3 rows: sparse (only 25% chance of a mushroom)
            // TODO: change this % to even lower
            count = Math.random() < 0.25 ? 1 : 0;
        } else if (r >= 10 && r <= 24) {
            // Upper-middle area: 2 mushrooms per row
            count = 2;
        } else {
            // Middle/upper field: 1 mushroom per row
            count = 1;
        }

        // Pick unique random columns for row 'r'
        var placed = 0;
        var attempts = 0;
        while (placed < count && attempts < 50) {
            var c = Math.floor(Math.random() * COLS);
            var key = c + "," + r;

            if (!occupied[key]) {
                occupied[key] = true;
                var clipPos = gridToClip(c, r);

                mushrooms.push({
                    col: c,
                    row: r,
                    x: clipPos.x,
                    y: clipPos.y,
                    health: 3 // real game uses 4, but this seems more suitable? 
                });
                placed++;
            }
            attempts++;
        }
    }

    // Buffer the octagon geometry once
    setupOctagon();
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
    gl.uniform4f(colorUniform, 0.7, 0.7, 0.7, 1.0); // Gray color
    gl.drawArrays(gl.LINES, 0, 2);
}

function mushroomHealthColor(health) {
    // function to return the color of the mushroom based on it's health (how many hits it has)
    // default (3) is green, 2 is yellow, 1 is red, and 0 means it should be removed from the screen
    // returns an array of the color to use
    var healthy = [0.0, 1.0, 0.0, 1.0]
    var oneHit = [1.0, 1.0, 0.0, 1.0];
    var twoHit = [1.0, 0.2, 0.2, 1.0];
    if (health === 3 ) {
        return healthy;
    }
    else if (health === 2){
        return oneHit;
    }
    else if (health === 1){
        return twoHit;
    }
    return healthy;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 1. Draw all mushrooms -- green 
    for (var i = 0; i < mushrooms.length; i++) {
        // console.log(mushroom[i])
        var mushroomColor = mushroomHealthColor(mushrooms[i].health);
        drawSingleOctagon(mushrooms[i].x, mushrooms[i].y, 0.0, mushroomColor);
    }

    // // 2. Update and draw bullets -- gray
    // for (var b = 0; b < bullets.length; b++) {
    //     bullets[b].y += bulletSpeed;

    //     // If bullet moves past the top of the screen, remove it
    //     if (bullets[b].y > 1.0) {
    //         bullets.splice(b, 1);
    //         b--;
    //         continue;
    //     }

    // }

    // BULLET COLLISION CHECK -- start 

    for (var bullet = 0; bullet < bullets.length; bullet++) {

        bullets[bullet].y += bulletSpeed;

        // check collisions against mushrooms
        var hitMushroom = false;
        for (var mushroom = 0; mushroom < mushrooms.length; mushroom++) {
            // console.log("this -- "  + bullets[bullet]);
            if (checkCollision(bullets[bullet].x, bullets[bullet].y, bulletRadius, mushrooms[mushroom].x, mushrooms[mushroom].y, mushroomRadius)){
                console.log("We have a collision" + mushrooms[mushroom].health);
                mushrooms[mushroom].health--;


                if (mushrooms[mushroom].health <= 0){
                    mushrooms.splice(mushroom, 1);
                }

                hitMushroom = true;
                break;
            }
        }

        // need to handle if the bullet hits or is past the screen
        if (hitMushroom || bullets[bullet].y > 1.0) {
            console.log("past screen or mushroom hit");
            bullets.splice(bullet, 1);
            bullet--;
            continue;
        }

        // check collisions against monsters TODO
        drawSingleBullet(bullets[bullet].x, bullets[bullet].y);
    }
    //BULLET COLLISION CHECK-- end 



    // 3. Move and draw player (Green)
    var nextX = moveX_JS + (speed * directionX);
    var nextY = moveY_JS + (speed * directionY);

    nextX = Math.max(minX, Math.min(maxX, nextX));
    nextY = Math.max(minY, Math.min(maxY, nextY));


    // COLLISION CHECK WITH MUSHROOM; user shouldn't be able to clip through mushrooms
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

    thetaJS += (rotateSpeed * stopStartFlag);
    // todo: this is the player character 
    // todo: rename this function to something else
    drawSingleOctagon(moveX_JS, moveY_JS, thetaJS, [0.0, 1.0, 1.0, 1.0]);

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

    createMushrooms();
    setupBullet();
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

    // // Create a buffer on the graphics card,
    // // and send array to the buffer for use
    // // in the shaders
    // var bufferId = gl.createBuffer();
    // gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    // gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPoints), gl.STATIC_DRAW );
    
    // // Create a pointer that iterates over the
    // // array of points in the shader code
    // var myPositionAttribute = gl.getAttribLocation( shaderProgramSquare, "myPosition" );
    // gl.vertexAttribPointer( myPositionAttribute, 2, gl.FLOAT, false, 0, 0 );
    // gl.enableVertexAttribArray( myPositionAttribute );    
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


function stopOrStartAnim() {
    if (stopStartFlag < 0.5) {
        stopStartFlag = 1.0;
    }
    else {
        stopStartFlag = 0.0;
    }
}

function moveOctagon(event){
    console.log("Currently not doing anything with mouse clicks");
    // var canvasX = event.clientX;
    // var canvasY = event.clientY;
    // moveX_JS = 2.0 * canvasX/512.0 - 1.0;
    // moveY_JS = -(2.0 * canvasY/512.0 - 1.0);

    // gl.uniform2f(moveUniform, moveX_JS, moveY_JS);

}

function moveOctagonKeys(event){
    var theKeyCode = event.keyCode;

    // MOVEMENT ====================================
    if (theKeyCode == 65 || theKeyCode == 37){ // a key || left arrow
        directionX = -1.0;
        directionY = 0.0;
    }
    else if (theKeyCode == 68 || theKeyCode == 39){ // d key || right arrow
        directionX = 1.0;
        directionY = 0.0;
    }
    else if (theKeyCode == 83 || theKeyCode == 40){ // s key || down
        directionY = -1.0;
        directionX = 0.0;
    }
    else if (theKeyCode == 87 || theKeyCode == 38){ // w key || up
        directionY = 1.0;
        directionX = 0.0;
    }
    // ====================================
    // SPACE BAR -- SHOOTING
    if (theKeyCode == 32) {
        event.preventDefault(); //handles to stop the page scrollign 
        bullets.push({
            x: moveX_JS,
            // y: moveY_JS + playerRadius 
            y: moveY_JS 
        });
    }

    
    gl.uniform2f(moveUniform, moveX_JS, moveY_JS);
}
