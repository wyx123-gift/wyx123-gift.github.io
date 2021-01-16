"use strict";

const{ vec2, vec3, vec4, mat3, mat4, quat } = glMatrix;

var canvas;
var gl;
var programtex;
var programskybox;

var objFileInput;
var textureFileInput;
var bumpFileInput;

var meshdata = null;
var mesh = null;
var meshinited = false;

var texture = null;
var texImage = null;
var bumpTexture = null;
var bumpTexImage = null;

var cubemapTexture = null;

var eye = vec3.fromValues( 0, 0, 1);
var at = vec3.fromValues( 0.0, 0.0, 0.0 );
var up = vec3.fromValues( 0.0, 1.0, 0.0 );

var meshNormalBuffer = null;
var meshTextureBuffer = null;
var meshVertexBuffer = null;
var meshIndexBuffer = null;

var side = 100;
var points = [];
var normals = [];
var texCoords = [];

var skyboxPoints = [];
var skyboxNormals = [];
var skyboxtexCoords = [];
var skyboxIndices = [];

var baseColor = vec4.fromValues(0.4, 0.4, 0.4, 1.0);
var textureAlpha = 0.0;
var bumpDepth = 0;

var matShininess = 1.0;
var matSmoothness = 0;
var shadowDepth = 0;

var averageBrightness = 0.0;
var maxBrightness = 0.0;

var modelViewMatrix = mat4.create();
var projectionMatrix = mat4.create();
var normalMatrix = mat3.create();
var invModelViewMatrix = mat4.create();

var skyboxModelViewMatrix = mat4.create();
var skyboxProjectionMatrix = mat4.create();

var modelViewMatrixLoc = null;
var projectionMatrixLoc = null;
var normalMatrixLoc = null;
var invModelViewMatrixLoc = null;

var positionLoc = null;
var normalLoc = null;
var iBuffer = null;

var skyboxvBuffer = null;
var skyboxnBuffer = null;
var skyboxiBuffer = null;
var skyboxpointsLoc = null;
var skyboxnormalsLoc = null;
var skyboxtexcoordsLoc = null;

var colorLoc = null;

var length = 3;
var left = -length;
var right = length;
var ytop = length;
var ybottom = -length;
var near = -length*2;
var far = length*4;

var pnear = 0.01;
var pfar = 200;
var radius = 5;
var theta = 0.0;
var phi = 0.0;

var fovy = 60 * Math.PI / 180.0;
var aspect;

/* object position */
var dx = 0;
var dy = 0;
var dz = 0;
// var dirx = 1;
// var diry = 1;

var dxt = 0;
var dyt = 0;
var dzt = 0;

var sx = 2;
var sy = 2;
var sz = 2;

var shininess = 1.0;
// var materialKa = 1.0;
// var materialKd = 1.0;
// var materialKs = 1.0;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var translation = 0;
var tran = [0, 0, 0];
var translationLoc;

var scale = 2;
var scaleLoc;

window.onload = function initWindow(){//窗口加载
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if( !gl ){
        alert( "WebGL isn't available" );
    }

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    programskybox = initShaders( gl, "vshader-skybox", "fshader-skybox" );
    gl.useProgram( programskybox );

    skyboxpointsLoc = gl.getAttribLocation( programskybox, "vPosition" );
    skyboxtexcoordsLoc = gl.getAttribLocation(programskybox, "vTexCoords" );

    programtex = initShaders( gl, "vshader-objtex", "fshader-objtex" );
    gl.useProgram( programtex ); //gai
    
    positionLoc = gl.getAttribLocation( programtex, "vPosition" );
    normalLoc = gl.getAttribLocation( programtex, "vNormal" );

    initInterface();

    configureCubeMapTexture();
    
    if( texture === null ){
        var url = "../../textures/roof.jpg";
        configureTexture( url );
    }

    if( bumpTexture === null ){
        var url = "../../textures/roof.jpg";
        configureBumpTexture(url);
    }

    buildSkyBox();

    initObjBuffers();

	// translationLoc = gl.getUniformLocation(programtex, "tran");
	// gl.uniform3fv(translationLoc, tran);
	
	// scaleLoc = gl.getUniformLocation( programtex, "scale" );

	// document.getElementById( "tx" ).onchange = function( event ){
	// 	tran[0] = event.target.value;
	// }
	// document.getElementById( "ty" ).onchange = function( event ){
	// 	tran[1] = event.target.value;
	// }
	// document.getElementById( "tz" ).onchange = function( event ){
	// 	tran[2] = event.target.value;
	// }
	// //-------------------------------------------------------------------
	// document.getElementById( "scale" ).onchange = function( event ){
	// 	scale = event.target.value;
	// }
	
    render();
}

function initObjBuffers(){//创建缓存
    meshNormalBuffer = gl.createBuffer();
    meshTextureBuffer = gl.createBuffer();
    meshVertexBuffer = gl.createBuffer();
    meshIndexBuffer = gl.createBuffer();
}

function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
      img.crossOrigin = "";
    }
}

function handleMouseDown(event) {//鼠标按下
    mouseDown = true;
    lastMouseX = event.clientX;//对应的位置
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {//检测鼠标抬起状态
    mouseDown = false;
}

function handleMouseMove(event) {//通过得到鼠标移动距离计算旋转位置
    if (!mouseDown)
        return;

    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = (newX - lastMouseX);

    var d = deltaX;

    theta = theta - parseFloat(d)*0.2;
    
    var deltaY = (newY - lastMouseY);

    d = deltaY;

    phi = phi - parseFloat(d)*0.2;

    lastMouseX = newX;
    lastMouseY = newY;
    buildModelViewProj();
}


function configureTexture( url ){//纹理文件
    texture = gl.createTexture();
    //gl.activeTexture( gl.TEXTURE1 );
    texImage = null;
    texImage = new Image();
    texImage.onload = function(){
        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImage );

        if(isPowerOf2(texImage.width) && isPowerOf2(texImage.height)){
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        }else{
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    requestCORSIfNotSameOrigin(texImage, url);
    texImage.src = url;
}

function configureBumpTexture( url ){//凹凸映射文件
    bumpTexture = gl.createTexture();
	//gl.activeTexture( gl.TEXTURE0 );
    bumpTexImage = null;
    bumpTexImage = new Image();
    bumpTexImage.onload = function(){
        gl.bindTexture( gl.TEXTURE_2D, bumpTexture );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bumpTexImage );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    };
    requestCORSIfNotSameOrigin(bumpTexImage, url);
    bumpTexImage.src = url;
}

var faceUrl = [//天空盒图片的路径位置
     '../../textures/pos-z.jpg',
        '../../textures/neg-z.jpg',
        '../../textures/neg-y.jpg',
        '../../textures/pos-y.jpg',
        '../../textures/neg-x.jpg',
        '../../textures/pos-x.jpg',
];

var cubemap_image_cnt = 0;    
var cubemap_image = [];

function configureCubeMapTexture(){
    cubemapTexture = gl.createTexture();
    //gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubemapTexture );
    for( var i = 0; i < 6; i++ ){
        cubemap_image[i] = new Image();
        cubemap_image[i].onload = function(){ 
            if( ++cubemap_image_cnt<6)
                return;
            
            var totalBrightness = 0;
            var thiscanvas;

            for( var k = 0; k < 6; k++ ){
                
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + k , 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubemap_image[k] );
                
                thiscanvas = document.createElement("canvas");
                thiscanvas.width = cubemap_image[k].width;
                thiscanvas.height = cubemap_image[k].height;
                var context = thiscanvas.getContext("2d");
                context.drawImage(cubemap_image[k], 0, 0 );
                var imgData = context.getImageData(0, 0, thiscanvas.width, thiscanvas.height);
                
                for( var x = 0, width = imgData.width; x < width; x++ ){
                    for( var y = 0, height = imgData.height; y < height; y++ ){
                        var p = (y*width+x)*4;
                        var brightness = (imgData.data[p] + imgData.data[p+1] + imgData.data[p+2])/(255*3);
                        maxBrightness = Math.max( maxBrightness, brightness );
                        totalBrightness += brightness;
                    }
                }
            }
            averageBrightness = totalBrightness / (imgData.width * imgData.height * 6);
            
            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
            gl.uniform1f(gl.getUniformLocation(programtex,"averageBrightness"), averageBrightness);
            gl.uniform1f(gl.getUniformLocation(programtex,"maxBrightness"), maxBrightness);
        }
        requestCORSIfNotSameOrigin(cubemap_image[i], faceUrl[i]);
        cubemap_image[i].src = faceUrl[i];
    }
}

function buildSkyBox(){//建立天空盒，类似建立正方体模型
    var vertices = [
    -side, -side,  side,
    -side,  side,  side,
     side,  side,  side,
     side, -side,  side,
    -side, -side, -side,
    -side,  side, -side,
     side,  side, -side,
     side, -side, -side
    ];

    var indices = [
        1, 0, 3,
        3, 2, 1, //front
        2, 3, 7,
        7, 6, 2, //right
        3, 0, 4,
        4, 7, 3, //bottom
        6, 5, 1,
        1, 2, 6, //top
        4, 5, 6,
        6, 7, 4, //back
        5, 4, 0,
        0, 1, 5 //left
    ];

    var texCoord = [
        vec2.fromValues( 0, 0 ),
        vec2.fromValues( 0, 1 ),
        vec2.fromValues( 1, 1 ),
        vec2.fromValues( 1, 0 )
    ];

    var texCoordID = [
        0, 1, 2, 0, 2, 3
    ];

    var fnormals = [
        vec3.fromValues( 0, 0, 1 ),
        vec3.fromValues( 1, 0, 0 ),
        vec3.fromValues( 0, -1, 0 ),
        vec3.fromValues( 0, 1, 0 ),
        vec3.fromValues( 0, 0, -1 ),
        vec3.fromValues( -1, 0, 0 )
    ];

    for( var i = 0; i < vertices.length; i++ )
        skyboxPoints.push( vertices[i] );
    for( var i = 0; i < indices.length; i++ ){
        skyboxPoints.push( vertices[indices[i]][0], vertices[indices[i]][1], vertices[indices[i]][2] );
        var texid = texCoordID[ i%6 ];
        var fnid = parseInt(i/6);
		skyboxtexCoords.push( texCoord[ texid ][0], texCoord[ texid ][1] );
        skyboxNormals.push( fnormals[fnid][0], fnormals[fnid][1], fnormals[fnid][2] );
        skyboxIndices.push(indices[i]);
    }

    skyboxvBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, skyboxvBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(skyboxPoints), gl.STATIC_DRAW );

    gl.vertexAttribPointer( skyboxpointsLoc, 3, gl.FLOAT, false, 0, 0 );

    skyboxnBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, skyboxnBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(skyboxNormals), gl.STATIC_DRAW );

    gl.vertexAttribPointer( skyboxnormalsLoc, 3, gl.FLOAT, false, 0, 0);

    skyboxiBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, skyboxiBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(skyboxIndices), gl.STATIC_DRAW );

    if(cubemapTexture){
        gl.useProgram(programskybox);
        gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubemapTexture );
        gl.uniform1i( gl.getUniformLocation( programskybox, "texCubemap" ), 0 );
    }
    
}

function initInterface(){//模型输入，网络端口配置，颜色改变，dom交互，鼠标点击交互调用
    objFileInput = document.getElementById("modelInput");
    objFileInput.addEventListener("change", function(event){
        var file = objFileInput.files[0];
        var reader = new FileReader();

        reader.onload = function(event){
            meshdata = reader.result;
            initObj();
        };
        reader.readAsText(file);
    });

    textureFileInput = document.getElementById("textureInput");
    textureFileInput.addEventListener("change", function(event){
        var file = textureFileInput.files[0];
        var prehead = "http://localhost:8080/";
        var imgurl = prehead.concat(file.name);
        configureTexture( imgurl );
    });

    bumpFileInput = document.getElementById("bumpInput");
    bumpFileInput.addEventListener("change", function(event){
        var file = bumpFileInput.files[0];
        var prehead = "http://localhost:8080/";
        var imgurl = prehead.concat(file.name);
        configureBumpTexture( imgurl );
    });

    document.getElementById("objcolor").addEventListener("input", function(event){
        var hexColor = this.value.substring(1);
        var rgbToHex = hexColor.match(/.{1,2}/g);
        baseColor = vec4.fromValues(
            parseInt(rgbToHex[0], 16) * 1.0 / 255.0,
            parseInt(rgbToHex[1], 16) * 1.0 / 255.0,
            parseInt(rgbToHex[2], 16) * 1.0 / 255.0,
            1.0
        );
    });
	
	document.getElementById( "scale" ).addEventListener("input", function(event){
			sx = this.value;
			sy = this.value;
			sz = this.value;
	    buildModelViewProj();
	});
	document.getElementById("xpos").addEventListener("input", function(event){

	        dx = this.value;

	    buildModelViewProj();
	});
	document.getElementById("ypos").addEventListener("input", function(event){

	        dy = this.value;

	    buildModelViewProj();
	});
	document.getElementById("zpos").addEventListener("input", function(event){

	        dz = this.value;

	    buildModelViewProj();
	});
	
	document.getElementById("xrot").addEventListener("input", function(event){

	        dxt = this.value;

	    buildModelViewProj();
	});
	document.getElementById("yrot").addEventListener("input", function(event){

	        dyt = this.value;

	    buildModelViewProj();
	});
	document.getElementById("zrot").addEventListener("input",function(event){

	        dzt = this.value;

	    buildModelViewProj();
	});

    document.getElementById("textureAlpha").addEventListener("input", function(event){
        textureAlpha = parseFloat(event.target.value);
    });

    document.getElementById("bumpdepth").addEventListener("input", function(event){
        bumpDepth = parseFloat(event.target.value);
    });

    document.getElementById("shininess").addEventListener("input", function(event){
        matShininess = parseFloat(event.target.value);   
    });

    // document.getElementById("shadowdepth").addEventListener("input", function(event){
    //     shadowDepth = parseFloat(event.target.value);
    // });

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
}

function isPowerOf2( value ){
    return (value & (value - 1)) == 0;
}

function initObj(){//obj模型文件标准化到2*2*2的立方体投影空间中
    // read obj file, initialize points, vertex coordinates, colors
    mesh = new OBJ.Mesh( meshdata );
    //OBJ.initMeshBuffers( gl, mesh );

    // normalize all vertex position into [-1,1], and center at [0,0,0]
    dx = -1.0 * (parseFloat(mesh.xmax) + parseFloat(mesh.xmin))/2.0;
    dy = -1.0 * (parseFloat(mesh.ymax) + parseFloat(mesh.ymin))/2.0;
    dz = -1.0 * (parseFloat(mesh.zmax) + parseFloat(mesh.zmin))/2.0;

    var maxScale;
    var scalex = Math.abs(parseFloat(mesh.xmax)-parseFloat(mesh.xmin));
    var scaley = Math.abs(parseFloat(mesh.ymax)-parseFloat(mesh.ymin));
    var scalez = Math.abs(parseFloat(mesh.zmax)-parseFloat(mesh.zmin));

    maxScale = Math.max(scalex, scaley, scalez);

    sx =  2.0/maxScale;
    sy =  2.0/maxScale;
    sz =  2.0/maxScale;
    meshinited = true;
    render();
}

function buildModelViewProj(){//建立模型视图矩阵
    var rthe = theta * Math.PI / 180.0;
    var rphi = phi * Math.PI / 180.0;

    vec3.set(eye, radius * Math.sin(rthe) * Math.cos(rphi), radius * Math.sin(rthe) * Math.sin(rphi), radius * Math.cos(rthe)); 
    
    mat4.lookAt( modelViewMatrix, eye, at, up );

    skyboxModelViewMatrix = mat4.clone( modelViewMatrix );

    //mat4.rotateY(skyboxModelViewMatrix, skyboxModelViewMatrix, dyt * Math.PI / 180.0);//天空盒旋转
    mat4.translate( modelViewMatrix, modelViewMatrix, vec3.fromValues( dx, dy, dz ) );
    mat4.scale(modelViewMatrix, modelViewMatrix, vec3.fromValues(sx, sy, sz));  
    // mat4.rotateZ(modelViewMatrix, modelViewMatrix, dzt * Math.PI / 180.0);//模型旋转
    // mat4.rotateY(modelViewMatrix, modelViewMatrix, dyt * Math.PI / 180.0);
    // mat4.rotateX(modelViewMatrix, modelViewMatrix, dxt * Math.PI / 180.0);
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, dzt * Math.PI / 180.0);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, dyt * Math.PI / 180.0);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, dxt * Math.PI / 180.0);
    //mat4.ortho( projectionMatrix, left, right, ybottom, ytop, near, far );//正交投影
    aspect = 1;
    mat4.perspective(projectionMatrix, fovy, aspect, pnear, pfar);

    mat3.fromMat4(normalMatrix, modelViewMatrix);
    
    mat3.normalFromMat4(invModelViewMatrix, modelViewMatrix);
    mat3.transpose(invModelViewMatrix, invModelViewMatrix);

}

function drawSkybox(){//绘制天空盒，分配空间
    //gl.cullFace(gl.FRONT);
    gl.useProgram( programskybox );
    gl.uniformMatrix4fv(gl.getUniformLocation(programskybox, "projectionMatrix"), false, new Float32Array(projectionMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(programskybox, "modelViewMatrix"), false, new Float32Array(skyboxModelViewMatrix));
    
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubemapTexture );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, skyboxnBuffer );
    gl.enableVertexAttribArray( skyboxnormalsLoc );
    gl.bindBuffer( gl.ARRAY_BUFFER, skyboxvBuffer );
    gl.vertexAttribPointer( skyboxpointsLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( skyboxpointsLoc);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxiBuffer);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0 );
    gl.disableVertexAttribArray(skyboxpointsLoc);
    gl.disableVertexAttribArray(skyboxnormalsLoc);
    //console.log("Skybox");
}

function drawObject(){//绘制obj模型，分配空间
    gl.useProgram( programtex );

    gl.uniformMatrix4fv(gl.getUniformLocation(programtex, "modelViewMatrix"), false, new Float32Array(modelViewMatrix));

    gl.uniformMatrix4fv(gl.getUniformLocation(programtex, "projectionMatrix"), false, new Float32Array(projectionMatrix));

    gl.uniformMatrix3fv(gl.getUniformLocation(programtex, "normalMatrix"), false, new Float32Array(normalMatrix));

    gl.uniform3fv( gl.getUniformLocation( programtex, "lightPos"), new Float32Array( eye ) );

    gl.uniform4fv(gl.getUniformLocation( programtex, "fColor" ), new Float32Array( baseColor ) );
    gl.uniform1f(gl.getUniformLocation(programtex,"textureAlpha"), textureAlpha);
    gl.uniform1f(gl.getUniformLocation(programtex,"shininess"), matShininess);
    gl.uniform1f(gl.getUniformLocation(programtex, "bumpDepth"), bumpDepth);
    if( meshinited === true ){
        gl.activeTexture( gl.TEXTURE1 );
        gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubemapTexture );
        
        gl.activeTexture( gl.TEXTURE2 );
        gl.bindTexture( gl.TEXTURE_2D, texture );

        gl.activeTexture( gl.TEXTURE3 );
        gl.bindTexture( gl.TEXTURE_2D, bumpTexture );
        
        if( mesh.inited === false ){
            gl.uniform1i( gl.getUniformLocation( programtex, "texCubemap" ), 1 );
            gl.uniform1i( gl.getUniformLocation( programtex, "texture" ), 2 );
            gl.uniform1i( gl.getUniformLocation( programtex, "texbump" ), 3 );
        
            OBJ.initMeshBuffers(gl, mesh);
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer );
            gl.vertexAttribPointer(normalLoc, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalLoc);
            gl.bindBuffer( gl.ARRAY_BUFFER, mesh.vertexBuffer );
            gl.vertexAttribPointer( positionLoc, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0 );
            gl.enableVertexAttribArray(positionLoc);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer );
        gl.enableVertexAttribArray(normalLoc);
        gl.bindBuffer( gl.ARRAY_BUFFER, mesh.vertexBuffer );
        gl.enableVertexAttribArray(positionLoc);  
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        gl.disableVertexAttribArray(positionLoc);
        gl.disableVertexAttribArray(normalLoc);
    }
}

function render(){//渲染
    gl.viewport( 0, 0, canvas.width, canvas.height );
    //aspect = canvas.width / canvas.height;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
	gl.uniform3fv(translationLoc, tran);
    
    gl.uniform1f( scaleLoc, scale );
    
    buildModelViewProj();
    drawSkybox();
    drawObject();

    // dyt += 0.5;
    // if( dyt > 360 )
    //     dyt -= 360;
    requestAnimFrame(render);
}
