function drawSquare() {
    
    var canvas=document.getElementById("gl-canvas");
    var gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    gl.viewport( 0, 0, 1024, 1024 );
    
    gl.clearColor( 1.0, 0.0, 0.0, 1.0 );
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    // Enter array set up code here
    var p0 = vec2( 0.0, 0.0 );
	var p1 = vec2( 1.0, 0.0 );
	var p2 = vec2( 1.0, 1.0 );
	var p3 = vec2( 0.0, 1.0 );
	arrayOfPointsForSquare = [p1, p0, p2, p3];
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,
                  flatten(arrayOfPointsForSquare), gl.STATIC_DRAW );
    
    var myShaderProgram =
        initShaders( gl,"vertex-shader", "fragment-shader" );
    gl.useProgram( myShaderProgram );
    
    var myPosition = gl.getAttribLocation( myShaderProgram, "myPosition" );
    gl.vertexAttribPointer( myPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPosition );
    
    
    // Enter drawArrays() code here
    // Think about whether you want to use triangle strip or triangle fan
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
}

