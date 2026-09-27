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
var speed = 0.01;
var rotateSpeed = 0.02;
var directionX = 1.0;
var directionY = 0.0;

// 
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

// function createMushrooms(){
//     // Function to handle the creation of the mushrooms, going to use octagons store it
//     var numMushrooms = 40;
//     // mushrooms = [];
//     for (var i = 0; i < numMushrooms; i++) {
//         // Random positions between -0.8 and +0.8 (staying inside canvas boundaries)
//         var randX = (Math.random() * 1.6) - 0.8;
//         var randY = (Math.random() * 1.6) - 0.8;
//         mushrooms.push({ x: randX, y: randY });
//     }
//     setupOctagon();
// }


var mushrooms = [];

function createMushrooms() {
    mushrooms = [];
    var occupied = {}; // Prevents placing two mushrooms in the same cell

    for (var r = 1; r < ROWS - 1; r++) {
        var count = 1;

        if (r <= 3) {
            // Bottom 2-3 rows: sparse (only 25% chance of a mushroom)
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
                    health: 4 // Classic Atari: mushrooms take 4 hits to destroy
                });
                placed++;
            }
            attempts++;
        }
    }

    // Buffer the octagon geometry once
    setupOctagon();
}

// Helper to draw an octagon at a specific position and rotation
function drawSingleOctagon(x, y, theta) {
    gl.uniform2f(moveUniform, x, y);
    gl.uniform1f(thetaUniform, theta);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);
}

function render() {
    // 1. Clear the screen once per frame
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 2. Draw all mushrooms (static, theta = 0)
    for (var i = 0; i < mushrooms.length; i++) {
        drawSingleOctagon(mushrooms[i].x, mushrooms[i].y, 0.0);
    }

    // 3. Update and draw the player / moving octagon
    moveX_JS += (speed * directionX);
    moveY_JS += (speed * directionY);
    thetaJS  += (rotateSpeed * stopStartFlag);

    drawSingleOctagon(moveX_JS, moveY_JS, thetaJS);

    // 4. Request next frame
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
    gl.uniform2f(moveUniform, moveX_JS, moveY_JS);

    // Force the WebGL context to clear the color buffer
    gl.clear( gl.COLOR_BUFFER_BIT );

    createMushrooms();
    render();

    // createMushrooms();
    
    // setupOctagon();
    
    // drawOctagon();
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

    // Create a buffer on the graphics card,
    // and send array to the buffer for use
    // in the shaders
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPoints), gl.STATIC_DRAW );
    
    // Create a pointer that iterates over the
    // array of points in the shader code
    var myPositionAttribute = gl.getAttribLocation( shaderProgramSquare, "myPosition" );
    gl.vertexAttribPointer( myPositionAttribute, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionAttribute );    
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
    var canvasX = event.clientX;
    var canvasY = event.clientY;
    moveX_JS = 2.0 * canvasX/512.0 - 1.0;
    moveY_JS = -(2.0 * canvasY/512.0 - 1.0);

    gl.uniform2f(moveUniform, moveX_JS, moveY_JS);

}

function moveOctagonKeys(event){
    var theKeyCode = event.keyCode;
    if (theKeyCode == 65){ // a key
        directionX = -1.0;
        directionY = 0.0;
    }
    else if (theKeyCode == 68){ // d key
        directionX = 1.0;
        directionY = 0.0;
    }
    else if (theKeyCode == 83){ // s key
        directionY = -1.0;
        directionX = 0.0;
    }
    else if (theKeyCode == 87){ // w key
        directionY = 1.0;
        directionX = 0.0;
    }
    gl.uniform2f(moveUniform, moveX_JS, moveY_JS);
}
