"use strict";

var gl;
var points;

window.onload = function init(){
	var canvas = document.getElementById( "triangle-canvas" );
	gl = WebGLUtils.setupWebGL( canvas );
	if( !gl ){
		alert( "WebGL isn't available" );
	}
      //三角形
      //var vertices = [
      //-1.0,-1.0,
      //1.0,-1.0,
      //0.0,1.0,
      //];
      //四边形
	var vertices = [
	  -1.0,-1.0,
	   1.0,-1.0,
	   1.0,1.0,
	  -1.0,1.0,
	]
      
      gl.viewport( 0, 0, canvas.width, canvas.height );
	    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
      
      var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	    gl.useProgram( program );

	
	    var bufferId = gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

	
	    var vPosition = gl.getAttribLocation( program, "vPosition" );
	    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	    gl.enableVertexAttribArray( vPosition );

	    render();
}

function render(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
	//gl.drawArrays( gl.TRIANGLES, 0, 3 );三角形
	//gl.drawArrays( gl.TRIANGLE_FANS, 3, 6 );
}
