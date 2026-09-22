// Xavier Wattermann
// Lab 2 - CEG-6500 
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
    
    setupOctagon();
    
    drawOctagon();
}

function setupOctagon() {
    var arrayOfPoints = [];
    var cx = 0.0;
    var cy = 0.0;
    var r = 0.2;
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
    // gl.uniform2f(moveUniform, moveX_JS, moveY_JS);
}