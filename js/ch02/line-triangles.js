"use strict";

const { vec3 } = glMatrix;

var theta=0;

var canvas;
var gl;
var colors = [];
var points = []; //存放顶点数组



var numTimesToSubdivide = 0;
var x;

function fchange3(){
	numTimesToSubdivide = document.getElementById("slide3").value;
}

function fchange2(){
	numTimesToSubdivide = document.getElementById("slide2").value;
}

function fchange(){
	numTimesToSubdivide = document.getElementById("slide").value;
}

function frota(){
	x = document.getElementById("rota").value;
	theta = Math.PI/180*x;
}

 //window.onload = 
 //形成旋转三角形/////////////////////////////////////////////////////////////////////////
 function initTriangles_rota(){
	colors=[];
	points = [];
	canvas = document.getElementById( "gl-canvas" );
	gl = WebGLUtils.setupWebGL( canvas );
	
	if( !gl ){
		alert( "WebGL isn't available" );
	}
	
	var vertices = [  //初始顶点数组
		-0.8165, -0.4714,  0,
		0.0000, 0.9428 ,  0,
		0.8165, -0.4714,  0,
	];
	

	var u = vec3.fromValues( vertices[0], vertices[1], vertices[2] ); //数组形式转为向量
	
	var v = vec3.fromValues( vertices[3], vertices[4], vertices[5] );
	
	var w = vec3.fromValues( vertices[6], vertices[7], vertices[8] );

	divideTriangle_rota( u, v, w, numTimesToSubdivide);

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	
	
	render_rota(); //绘制三角形

};
////////////////////////////////////////////////////////////////////////////////////////////////////
//形成3D三角形
function init() {
	colors=[];
    canvas = document.getElementById("gl-canvas");
	points = [];
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    var vertices = [
        0.0000, 0.0000, -1.0000,
        0.0000, 0.9428, 0.3333,
        -0.8165, -0.4714, 0.3333,
        0.8165, -0.4714, 0.3333
    ];

    
    var t = vec3.fromValues( vertices[0], vertices[1], vertices[2] );
    
    var u = vec3.fromValues( vertices[3], vertices[4], vertices[5] );
   
    var v = vec3.fromValues( vertices[6], vertices[7], vertices[8] );

    var w = vec3.fromValues( vertices[9], vertices[10], vertices[11] );

    divideTetra(t, u, v, w, numTimesToSubdivide);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    render();
};
///////////////////////////////////////////////////////////////////////////////////////////////////

function initTriangles(){
	colors=[];
	points = [];
	canvas = document.getElementById( "gl-canvas" );
	gl = WebGLUtils.setupWebGL( canvas );
	
	if( !gl ){
		alert( "WebGL isn't available" );
	}
	
	var vertices = [  //初始顶点数组
		-0.8165, -0.4714,  0,
		0.0000, 0.9428 ,  0,
		0.8165, -0.4714,  0,
	];

	var u = vec3.fromValues( vertices[0], vertices[1], vertices[2] ); //数组形式转为向量
	
	var v = vec3.fromValues( vertices[3], vertices[4], vertices[5] );
	
	var w = vec3.fromValues( vertices[6], vertices[7], vertices[8] );

	divideTriangle_1( u, v, w, numTimesToSubdivide);

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	

	render_1(); //绘制三角形
};

function triangle(a, b, c, color) {
    // add colors and vertices for one triangle
    var baseColor = [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 0.0
    ];

    for (var k = 0; k < 3; k++) {
        colors.push(baseColor[color * 3 + k]);
    }
    for (var k = 0; k < 3; k++)
        points.push(a[k]);

    for (var k = 0; k < 3; k++) {
        colors.push(baseColor[color * 3 + k]);
    }
    for (var k = 0; k < 3; k++)
        points.push(b[k]);

    for (var k = 0; k < 3; k++) {
        colors.push(baseColor[color * 3 + k]);
    }
    for (var k = 0; k < 3; k++)
        points.push(c[k]);
}

function tetra(a, b, c, d) {
    triangle(a, c, b, 0);
    triangle(a, c, d, 1);
    triangle(a, b, d, 2);
    triangle(b, c, d, 3);
}


function triangle_rota( a, b, c ){  //a，b，c分别为三个向量
	//var k;
	var da=Math.sqrt(a[0]*a[0]+a[1]*a[1]);
	var db=Math.sqrt(b[0]*b[0]+b[1]*b[1]);
	var dc=Math.sqrt(c[0]*c[0]+c[1]*c[1]);
	
	var baseColor = [1.0,0.0,1.0,];
	for(var k=0;k<3;k++){
		colors.push(baseColor[k]);
	}
	for(var k=0;k<3;k++){
		colors.push(baseColor[k]);
	}
	for(var k=0;k<3;k++){
		colors.push(baseColor[k]);
	}
	for(var k=0;k<3;k++){
		colors.push(baseColor[k]);
	}
	for(var k=0;k<3;k++){
		colors.push(baseColor[k]);
	}
	for(var k=0;k<3;k++){
		colors.push(baseColor[k]);
	}
	
	points.push( a[0]*Math.cos(da*theta)-a[1]*Math.sin(da*theta), a[0]*Math.sin(da*theta)+a[1]*Math.cos(da*theta), a[2] );  //以数组形式存放到空数组points中
	points.push( b[0]*Math.cos(db*theta)-b[1]*Math.sin(db*theta), b[0]*Math.sin(db*theta)+b[1]*Math.cos(db*theta), b[2] );
	
	points.push( b[0]*Math.cos(db*theta)-b[1]*Math.sin(db*theta), b[0]*Math.sin(db*theta)+b[1]*Math.cos(db*theta), b[2] );
	points.push( c[0]*Math.cos(dc*theta)-c[1]*Math.sin(dc*theta), c[0]*Math.sin(dc*theta)+c[1]*Math.cos(dc*theta), c[2] );
	
	points.push( c[0]*Math.cos(dc*theta)-c[1]*Math.sin(dc*theta), c[0]*Math.sin(dc*theta)+c[1]*Math.cos(dc*theta), c[2] );
	points.push( a[0]*Math.cos(da*theta)-a[1]*Math.sin(da*theta), a[0]*Math.sin(da*theta)+a[1]*Math.cos(da*theta), a[2] );
	
}

function triangle_1( a, b, c ){  //a，b，c分别为三个向量
	//var k;
	var baseColor = [1.0,0.0,1.0,];
	for(var k=0;k<3;k++){
		colors.push(baseColor[k]);
	}
	for(var k=0;k<3;k++){
		colors.push(baseColor[k]);
	}
	for(var k=0;k<3;k++){
		colors.push(baseColor[k]);
	}
	points.push( a[0], a[1], a[2] );  //以数组形式存放到空数组points中
	points.push( b[0], b[1], b[2] );
	points.push( c[0], c[1], c[2] );
	
}

function divideTetra(a, b, c, d, count) {
    // check for end of recursion
    if (count == 0) {
        tetra(a, b, c, d);
    } else {
        var ab = vec3.create();
        vec3.lerp(ab, a, b, 0.5);
        var ac = vec3.create();
        vec3.lerp(ac, a, c, 0.5);
        var ad = vec3.create();
        vec3.lerp(ad, a, d, 0.5);
        var bc = vec3.create();
        vec3.lerp(bc, b, c, 0.5);
        var bd = vec3.create();
        vec3.lerp(bd, b, d, 0.5);
        var cd = vec3.create();
        vec3.lerp(cd, c, d, 0.5);

        --count;

        divideTetra(a, ab, ac, ad, count);
        divideTetra(ab, b, bc, bd, count);
        divideTetra(ac, bc, c, cd, count);
        divideTetra(ad, bd, cd, d, count);
    }

}

function divideTriangle_1( a, b, c, count ){
	// check for end of recursion
	if( count == 0 ){
		triangle_1( a, b, c );
	}else{
		var ab = vec3.create();
		vec3.lerp( ab, a, b, 0.5 ); //ab中点
		var bc = vec3.create();
		vec3.lerp( bc, b, c, 0.5 );
		var ca = vec3.create();
		vec3.lerp( ca, c, a, 0.5 );

		--count;

		// three new triangles
		divideTriangle_1( a, ab, ca, count );
		divideTriangle_1( b, bc, ab, count );
		divideTriangle_1( c, ca, bc, count );
	}
}

function divideTriangle_rota( a, b, c, count ){
	// check for end of recursion
	if( count == 0 ){
		triangle_rota( a, b, c );
	}else{
		var ab = vec3.create();
		vec3.lerp( ab, a, b, 0.5 ); //ab中点
		var bc = vec3.create();
		vec3.lerp( bc, b, c, 0.5 );
		var ca = vec3.create();
		vec3.lerp( ca, c, a, 0.5 );

		

		// three new triangles
		divideTriangle_rota( a, ab, ca, count-1 );
		divideTriangle_rota( b, bc, ab, count-1 );
		divideTriangle_rota( c, ca, bc, count-1 );
		
		divideTriangle_rota( ab, bc, ca, count-1 );
	}
}


function render_rota(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays( gl.LINES, 0, points.length/3);
}

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays( gl.TRIANGLES, 0, points.length/3 );
}

function render_1(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays( gl.TRIANGLES, 0, points.length/3 );
}