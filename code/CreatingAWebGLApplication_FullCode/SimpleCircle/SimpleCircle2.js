function drawCircle() {
    
    var canvas=document.getElementById("gl-canvas");
    var gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    gl.viewport( 0, 0, 512, 512 );
    
    gl.clearColor( 1.0, 0.0, 0.0, 1.0 );
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    var arrayOfPointsForCircle=[];
    
    // Enter array set up code here
    // Use the parametric form of the circle equations:
    //    x = r cos(theta) + a
    //    y = r sin(theta) + b
	
	var thetastart = 0.0;
	var thetaend = 2.0 * Math.PI;
	var n = 2.0;
	var thetastep = thetaend/n;
	var i = 0.0;
	var r = 0.6;
	var a = -0.1;
	var b = 0.2;
	
	console.log( thetastep );
	
	for (i = 0.0; i < n; i = i + 1.0) {
		var theta = i * thetastep;
		var x = a + r * Math.cos( theta );
		var y = b + r * Math.sin( theta );
		var p = vec2( x,y );
		arrayOfPointsForCircle.push( p );
	}
    
	console.log( "Here1.1" );
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,
                  flatten(arrayOfPointsForCircle), gl.STATIC_DRAW );
    
    var myShaderProgram =
        initShaders( gl,"vertex-shader", "fragment-shader" );
    gl.useProgram( myShaderProgram );
    
    var myPosition = gl.getAttribLocation( myShaderProgram, "myPosition" );
    gl.vertexAttribPointer( myPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPosition );
    console.log( "Here1.2" );
    // Enter drawArrays code here
	gl.drawArrays( gl.LINE_LOOP, 0, n );
	console.log( "Here1.3" );
}

