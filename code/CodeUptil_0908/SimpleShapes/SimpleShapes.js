var gl;
var myShaderProgramSquare;
var myShaderProgramTriangle;

function init() {
	var canvas=document.getElementById("gl-canvas");
    gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    gl.viewport( 0, 0, 1024, 1024 );
    
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	myShaderProgramSquare =
        initShaders( gl,"vertex-shader", "fragment-shader-square" );
    
	myShaderProgramTriangle =
        initShaders( gl,"vertex-shader", "fragment-shader-triangle" );
    
	drawSquare();
	
	drawTriangle();
}

function drawSquare() {
    
    
    // Enter array set up code here
    var p0 = vec2( 0.0, 0.0 );
	var p1 = vec2( 1.0, 0.0 );
	var p2 = vec2( 1.0, 1.0 );
	var p3 = vec2( 0.0, 1.0 );
	arrayOfPointsForSquare = [p1, p0, p2, p3];
    
    var bufferIdSquare = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdSquare );
    gl.bufferData( gl.ARRAY_BUFFER,
                  flatten(arrayOfPointsForSquare), gl.STATIC_DRAW );
    
    var myPositionHandle = gl.getAttribLocation( myShaderProgramSquare, "myPosition" );
    gl.vertexAttribPointer( myPositionHandle, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionHandle );
    
    gl.useProgram( myShaderProgramSquare );
    
    // Enter drawArrays() code here
    // Think about whether you want to use triangle strip or triangle fan
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 3 );
}

function drawTriangle() {
    
    // Enter array set up code here
	var p0 = vec2( 0.0, 0.0 );
    var p1 = vec2( -1.0, 0.0 );
    var p2 = vec2( 0.0, -1.0 );
    var arrayOfPointsForTriangle = [p0, p1, p2];
    
    var bufferIdTriangle = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdTriangle );
    gl.bufferData( gl.ARRAY_BUFFER,
                  flatten(arrayOfPointsForTriangle), gl.STATIC_DRAW );
    
    
    var myPositionHandle = gl.getAttribLocation( myShaderProgramTriangle, "myPosition" );
    gl.vertexAttribPointer( myPositionHandle, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionHandle );
    
    gl.useProgram( myShaderProgramTriangle );
    
    // Enter drawArrays() code here
    // Think about whether you want to use triangle strip or triangle fan
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 3 );
}
