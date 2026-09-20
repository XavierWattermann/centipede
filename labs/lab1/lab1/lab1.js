// Xavier Wattermann
// Lab 1 - CEG-6500 
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
    var myColorLocation = gl.getUniformLocation(myShaderProgram, "myColor");
    // 1 -> TRIANGLE CODE [only <=4 vertices shape allowed]
    // Enter array set up code here
	var p0 = vec2( 0.0, 0.0 );
    var p1 = vec2( 1.0, 0.0 );
    var p2 = vec2( 0.0, 1.0 );
    var arrayOfPoints = [p0, p1, p2];
    var triangleStart = 0;
    var triangleEnd = arrayOfPoints.length;

    // 2 -> ELLIPSE CODE; >5 vertices needed
    // Either: ((x-a)^2)/c^2 + ((y-b)^2)/d^2 = 1

    // Or: x = c cos(theta) + a
    // &nbsp; &nbsp; y = d sin(theta) + b

    var ellipseStart = arrayOfPoints.length;
    var a = -0.4; 
    var b = -0.4; 
    var c =  0.5; 
    var d = c/2;

    var xstart = a - c;
    var xend   = a + c;
    var n = 120;
    var xstep  = (xend - xstart) / (n - 1.0);
    var i = 0;

    for (i = 0; i < n; i++) {
        var x = xstart + i * xstep;
        var term = 1.0 - Math.pow(x - a, 2) / Math.pow(c, 2);
        var y = b + d * Math.sqrt(Math.max(0.0, term));
        arrayOfPoints.push(vec2(x, y));
    }

    for (i = 0; i < n; i++) {
        var x = xend - i * xstep;
        var term = 1.0 - Math.pow(x - a, 2) / Math.pow(c, 2);
        var y = b - d * Math.sqrt(Math.max(0.0, term));
        arrayOfPoints.push(vec2(x, y));
    }
    var ellipseEnd = arrayOfPoints.length - ellipseStart;

    // 3 -> Octagon; >4 vertices needed
    var octagonStart = arrayOfPoints.length;
    var cx = 0.5;
    var cy = -0.5;
    var r = 0.4;
    var sides = 8;

    for (var i = 0; i < sides; i++) {
        var angle = i * (2.0 * Math.PI / sides);
        var x = cx + r * Math.cos(angle);
        var y = cy + r * Math.sin(angle);
        arrayOfPoints.push(vec2(x, y));
    }
    var octagonEnd = arrayOfPoints.length - octagonStart;



    // buffer + array points
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,
                  flatten(arrayOfPoints), gl.STATIC_DRAW );
    
    
    var myPositionHandle = gl.getAttribLocation( myShaderProgram, "myPosition" );
    gl.vertexAttribPointer( myPositionHandle, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionHandle );


    // drawArrays() here 

    // Think about whether you want to use triangle strip or triangle fan
    // triangle
    gl.uniform4f(myColorLocation, 1.0, 1.0, 0.0, 1.0);
    gl.drawArrays( gl.LINE_LOOP, triangleStart, triangleEnd);

    // ellipse
    gl.uniform4f(myColorLocation, 0.4784, 0.5725, 0.2667, 1.0); //this is suppose to be shrek green
    gl.drawArrays( gl.TRIANGLE_FAN, ellipseStart, ellipseEnd);

    // octagon
    gl.uniform4f(myColorLocation, 1.0,0.0, 0.0, 1.0);
    gl.drawArrays(gl.TRIANGLE_FAN, octagonStart, octagonEnd);

}




