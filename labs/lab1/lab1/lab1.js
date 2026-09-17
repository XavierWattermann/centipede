function drawShapes() {
    // Function to handle drawing all the shapes
    
    var canvas=document.getElementById("gl-canvas");
    var gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    // gl.viewport( 0, 0, 1024, 1024 );
    gl.viewport( 0, 0, 512, 512 );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    var myShaderProgram = initShaders( gl,"vertex-shader", "fragment-shader" );
    gl.useProgram( myShaderProgram );

    // 1 -> TRIANGLE CODE [only <=4 vertices shape allowed]
    // Enter array set up code here
	var p0 = vec2( 0.0, 0.0 );
    var p1 = vec2( 1.0, 0.0 );
    var p2 = vec2( 0.0, 1.0 );
    var arrayOfPoints = [p0, p1, p2];

    // 2 -> ELLIPSE CODE; >5 vertices needed
    // let's start with adding a circle
    // Either: ((x-a)^2)/c^2 + ((y-b)^2)/d^2 = 1

    // Or: x = c cos(theta) + a
    // &nbsp; &nbsp; y = d sin(theta) + b
	// var xend = 1.0;
	// var xstart = -1.0;
	// var n = 80;
	// var xstep = (xend-xstart)/(n-1.0);
	// var i = 0;
	// var r = 1.0;

    // for (i = 0; i < n; i++){
    //     var x = xstart + i * xstep;
    //     var y = b * Math.sqrt(1 - (x**2/a**2));
    // }


    // Center coordinates (a, b) and semi-axes (c, d)
    var a = -0.5; // center x-offset
    var b = -0.4; // center y-offset
    // var a = -0.6; // center x-offset
    // var b = -0.3; // center y-offset
    var c =  0.4; // horizontal semi-axis
    var d =  0.2; // vertical semi-axis

    var xstart = a - c;
    var xend   = a + c;
    var n = 80;
    var xstep  = (xend - xstart) / (n - 1.0);
    var i = 0;

    // Top half: left-to-right (xstart -> xend)
    for (i = 0; i < n; i++) {
        var x = xstart + i * xstep;
        // var term = 1.0 - Math.pow(x - a, 2) / Math.pow(c, 2);
        // var y = b + d * Math.sqrt(Math.max(0.0, term));
        var y = b + d;
        arrayOfPoints.push(vec2(x, y));
    }

    // Bottom half: right-to-left (xend -> xstart) to preserve a continuous winding loop
    for (i = 0; i < n; i++) {
        var x = xend - i * xstep;
        // var term = 1.0 - Math.pow(x - a, 2) / Math.pow(c, 2);
        // var y = b - d * Math.sqrt(Math.max(0.0, term));
        var y = b - d;
        arrayOfPoints.push(vec2(x, y));
    }
	
	
	// for (i = 0; i < n; i++) {
	// 	var x = xstart + i * xstep;
	// 	var y = Math.sqrt( r * r - x * x );
	// 	var p = vec2( x, y );
	// 	arrayOfPoints.push( p );
	// }
	
	// for (i = 0; i < n; i++) {
	// 	var x = xstart + i * xstep;
	// 	var y = -Math.sqrt( r * r - x * x );
	// 	var p = vec2( x, y );
	// 	arrayOfPoints.push( p );
	// }

    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,
                  flatten(arrayOfPoints), gl.STATIC_DRAW );
    
    
    var myPositionHandle = gl.getAttribLocation( myShaderProgram, "myPosition" );
    gl.vertexAttribPointer( myPositionHandle, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionHandle );
    



    // 3 -> [NEW SHAPE] CODE; >4 vertices needed
    
    // Think about whether you want to use triangle strip or triangle fan
	gl.drawArrays( gl.LINE_LOOP, 0, 3 );
	gl.drawArrays( gl.TRIANGLE_FAN, 4, (n*2)-1 ); //hard coding these indices values is no bueno
}




function drawCircle() {
    
    var canvas=document.getElementById("gl-canvas");
    var gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    gl.viewport( 0, 0, 512, 512 );
    
    gl.clearColor( 1.0, 0.0, 0.0, 1.0 );
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    var arrayOfPointsForCircle=[];
    
    // Enter array setup code here
    // Use the implicit form of the circle equation here:
    // (x-a)^2 + (y-b)^2 = r^2.
	
	var xend = 1.0;
	var xstart = -1.0;
	var n = 9;
	var xstep = (xend-xstart)/(n-1.0);
	var i = 0;
	var r = 1.0;
	
	arrayOfPointsForCircle.push( vec2( 0.0, 0.0 ) );
	
	for (i = 0; i < n; i++) {
		var x = xstart + i * xstep;
		var y = Math.sqrt( r * r - x * x );
		var p = vec2( x, y );
		arrayOfPointsForCircle.push( p );
		//console.log( p );
	}
	
	for (i = 0; i < n; i++) {
		var x = xstart + i * xstep;
		var y = -Math.sqrt( r * r - x * x );
		var p = vec2( x, y );
		arrayOfPointsForCircle.push( p );
		//console.log( p );
	}
    
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
    
    // Enter draw arrays code here
	gl.drawArrays( gl.TRIANGLE_FAN, 0, 2*n+1 );

    
}



