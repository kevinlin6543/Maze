var canvas;
var gl;

var program;
var vPos;
var vNormal;
var vTexCoord;

var isTopMode = false;
var image = [];

var worldIMG;
var textureSUM = 19;
var cubePosition = [];

var maze = [['#','#','#','#','#','#','#','#','#','#'],
            ['#',' ',' ',' ',' ',' ',' ','#',' ','#'],
            ['#',' ','#',' ','#','#',' ','#',' ','#'],
            ['#',' ','#',' ','#',' ',' ',' ',' ','#'],
            ['#',' ','#',' ','#',' ','#',' ',' ','#'],
            ['#','#','#','#','#',' ','#','#',' ','#'],
            ['#',' ',' ',' ','#',' ',' ','#',' ','#'],
            ['#',' ','#','#','#','#',' ','#',' ','#'],
            ['#',' ',' ',' ',' ',' ',' ','#',' ',' '],
            ['#','#','#','#','#','#','#','#','#','#']];

var translateMaze = function (maze) {
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            if (maze[i][j] === '#')
                cubePosition.push(vec4(i, 0, j, 1));
        }
    }
};

var cube = {
    ambient :  vec4(0.0, 0.5, 0.5, 1.0),
    diffuse :  vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    isPhong : false,
    center : 1,
    side : 1,
    vertices :[
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 ) ],
    vertexNum: 36,
    texCoord: [
        vec2(0, 1),
        vec2(0, 0),
        vec2(1, 0),
        vec2(1, 1)
    ],
    pointsArray : [],
    normalsArray : [],
    texCoordsArray: [],
    ambientProduct : vec4(),
    diffuseProduct : vec4(),
    specularProduct : vec4(),
    modelMatrix : mat4(),
    modelViewMatrix : mat4(),
    tempModelMatrix: mat4(),
};

cube.init = function() {
    drawCube();
    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    cube.vBuffer = gl.createBuffer();
    cube.nBuffer = gl.createBuffer();
    cube.tBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER,cube.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(cube.pointsArray),gl.STATIC_DRAW);
    gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    gl.bindBuffer(gl.ARRAY_BUFFER,cube.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(cube.normalsArray),gl.STATIC_DRAW);

    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindBuffer( gl.ARRAY_BUFFER, cube.tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cube.texCoordsArray), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    cube.ambientProduct = mult(cube.ambient, light.ambient);
    cube.diffuseProduct = mult(cube.diffuse, light.diffuse);
    cube.specularProduct = mult(cube.specular, light.specular);
    worldIMG = document.getElementById("texImage100");
    cube.texture = [];

    for(var k = 0; k < textureSUM; k++) {
        image.push(document.getElementById("texImage0"));
        cube.texture .push(gl.createTexture());

        gl.bindTexture( gl.TEXTURE_2D, cube.texture[k] );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[k] );

        gl.generateMipmap( gl.TEXTURE_2D );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

    cube.texture_world = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, cube.texture_world );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, worldIMG );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
};

cube.draw = function(position, texture ) {
    gl.enableVertexAttribArray( vTexCoord);
    gl.bindTexture( gl.TEXTURE_2D, texture );

    gl.bindBuffer( gl.ARRAY_BUFFER, cube.vBuffer );
    gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer( gl.ARRAY_BUFFER, cube.nBuffer );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, cube.tBuffer);
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );

    gl.uniform4fv( storageObj.ambientProductLoc,flatten(cube.ambientProduct) );
    gl.uniform4fv( storageObj.diffuseProductLoc,flatten(cube.diffuseProduct) );
    gl.uniform4fv( storageObj.specularProductLoc,flatten(cube.specularProduct) );
    gl.uniform1f( storageObj.shininessLoc, cube.shininess );
    gl.uniform1i( storageObj.isPhongLoc, cube.isPhong );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    cube.tempModelMatrix = mult(translate(position[0], position[1], position[2]), cube.modelMatrix);
    cube.modelViewMatrix = mult(camera.viewMatrix, cube.tempModelMatrix);
    cube.normalMatrix =  transpose(invert4(cube.modelViewMatrix));
    light.modelViewMatrix = mult(camera.viewMatrix, light.modelMatrix);

    gl.uniformMatrix4fv(storageObj.modelViewMatrixLoc, false, flatten(cube.modelViewMatrix) );
    gl.uniformMatrix4fv(storageObj.normalMatrixLoc, false, flatten(cube.normalMatrix) );
    gl.uniformMatrix4fv(storageObj.modelMatrixLoc, false, flatten(cube.tempModelMatrix));
    gl.uniform4fv(storageObj.spherePositionLoc, flatten(sphere.position));

    gl.uniformMatrix4fv(storageObj.lightModelViewMatrixLoc, false, flatten(sphere.modelViewMatrix));

    gl.uniformMatrix4fv(storageObj.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, cube.pointsArray.length );
};

cube.makeLargeCube = function() {
    var position = vec4(0,0,0,1);

    gl.enableVertexAttribArray( vTexCoord);
    gl.bindTexture( gl.TEXTURE_2D, cube.texture_world );
    gl.bindBuffer( gl.ARRAY_BUFFER, cube.vBuffer );
    gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer( gl.ARRAY_BUFFER, cube.nBuffer );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, cube.tBuffer);
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );

    gl.uniform4fv( storageObj.ambientProductLoc,flatten(cube.ambientProduct) );
    gl.uniform4fv( storageObj.diffuseProductLoc,flatten(cube.diffuseProduct) );
    gl.uniform4fv( storageObj.specularProductLoc,flatten(cube.specularProduct) );
    gl.uniform1f( storageObj.shininessLoc, cube.shininess );
    gl.uniform1i( storageObj.isPhongLoc, cube.isPhong );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    cube.tempModelMatrix = mult(translate(position[0], position[1], position[2]), cube.modelMatrix);
    cube.tempModelMatrix = mult(scale(100, 100, 100), cube.tempModelMatrix);
    cube.modelViewMatrix = mult(camera.viewMatrix, cube.tempModelMatrix);
    cube.normalMatrix =  transpose(invert4(cube.modelViewMatrix));
    light.modelViewMatrix = mult(camera.viewMatrix, light.modelMatrix);

    gl.uniformMatrix4fv(storageObj.modelViewMatrixLoc, false, flatten(cube.modelViewMatrix) );
    gl.uniformMatrix4fv(storageObj.normalMatrixLoc, false, flatten(cube.normalMatrix) );
    gl.uniformMatrix4fv(storageObj.modelMatrixLoc, false, flatten(cube.tempModelMatrix));
    gl.uniform4fv(storageObj.spherePositionLoc, flatten(sphere.position));
    gl.uniformMatrix4fv(storageObj.lightModelViewMatrixLoc, false, flatten(sphere.modelViewMatrix));
    gl.uniformMatrix4fv(storageObj.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, cube.pointsArray.length );
};

var sphere = {
    ambient : vec4(0.8, 0.1, 0.1, 1.0),
    diffuse : vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    position : vec4(0,-0.45,-3,1),
    vertexNum : 0,
    shadingStyle : 3,
    isPhong : true,
    pointsArray : [],
    normalsArray : [],
    ambientProduct : vec4(),
    diffuseProduct : vec4(),
    specularProduct : vec4(),
    modelMatrix : mat4(),
    modelViewMatrix : mat4(),
    rollMatrix : mat4(),
    complexity : 5,
    radius : 0.05,
    speed : vec4(0,0,0,0),
    fractionConstant : 1/3000,
    topSpeed : 1/30
};

sphere.init = function() {
    generateSpheres();
    sphere.vBuffer = gl.createBuffer();
    sphere.nBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER,sphere.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(sphere.pointsArray),gl.STATIC_DRAW);
    gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
    gl.bindBuffer(gl.ARRAY_BUFFER,sphere.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(sphere.normalsArray),gl.STATIC_DRAW);

    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    sphere.modelMatrix = mult(scale(sphere.radius,sphere.radius,sphere.radius),mat4());
    sphere.modelMatrix = mult(translate(2.7,-0.45,1.0), sphere.modelMatrix);
    sphere.position = vec4(2.7,-0.45,1.0);
    camera.position = add(sphere.position, vec4(camera.distanceToSphere,0,0,0));
    camera.eye = v4ToV3(camera.position);
    camera.at = v4ToV3(sphere.position);
    camera.up = vec3(0,1,0);
    camera.gameTopViewMatrix = lookAt([4,20,4],[4,0,4],[0,0,1]);
};

sphere.draw = function() {
    gl.disableVertexAttribArray( vTexCoord);

    gl.bindBuffer( gl.ARRAY_BUFFER, sphere.vBuffer );
    gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer( gl.ARRAY_BUFFER, sphere.nBuffer );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

    sphere.move();

    gl.uniform4fv( storageObj.ambientProductLoc,flatten(sphere.ambientProduct) );
    gl.uniform4fv( storageObj.diffuseProductLoc,flatten(sphere.diffuseProduct) );
    gl.uniform4fv( storageObj.specularProductLoc,flatten(sphere.specularProduct) );
    gl.uniform1f( storageObj.shininessLoc, sphere.shininess );
    gl.uniform1i( storageObj.isPhongLoc, sphere.isPhong );

    sphere.modelViewMatrix = mult(sphere.modelMatrix, sphere.rollMatrix);
    sphere.modelViewMatrix = mult(camera.viewMatrix, sphere.modelViewMatrix);
    sphere.normalMatrix =  transpose(invert4(sphere.modelViewMatrix));
    light.modelViewMatrix = mult(camera.viewMatrix, light.modelMatrix);

    gl.uniformMatrix4fv(storageObj.modelViewMatrixLoc, false, flatten(sphere.modelViewMatrix) );
    gl.uniformMatrix4fv(storageObj.normalMatrixLoc, false, flatten(sphere.normalMatrix) );
    gl.uniformMatrix4fv(storageObj.modelMatrixLoc, false, flatten(sphere.modelMatrix));
    gl.uniform4fv(storageObj.spherePositionLoc, flatten(sphere.position));

    gl.uniformMatrix4fv(storageObj.lightModelViewMatrixLoc, false, flatten(sphere.modelViewMatrix));

    gl.uniformMatrix4fv(storageObj.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

    var tempAmbientProduct = sphere.ambientProduct.slice();
    for(var j=0; j < sphere.vertexNum; j+=3) {
        tempAmbientProduct[0] -= 1/sphere.vertexNum;
        gl.uniform4fv( storageObj.ambientProductLoc,flatten(tempAmbientProduct));
        gl.drawArrays(gl.TRIANGLES, j, 3);
    }
};

sphere.move = function(){

    sphere.collisionDetection();

    sphere.roll();
    sphere.position = add(sphere.position,sphere.speed);

    var vx = sphere.speed[0], vy = sphere.speed[1], vz = sphere.speed[2];
    sphere.modelMatrix = mult(translate(vx,vy,vz), sphere.modelMatrix);

    camera.position = add(camera.position, sphere.speed);
    camera.eye = v4ToV3(camera.position);
    camera.at = v4ToV3(sphere.position);
    camera.gameSphereViewMatrix = lookAt(camera.eye,camera.at,camera.up);

    var speed = length(sphere.speed);
    if (speed < sphere.fractionConstant)
        sphere.speed = vec4(0,0,0,0);
    else {
        var oppositeVec = negate(sphere.speed);
        oppositeVec = normalize(oppositeVec);
        oppositeVec = vscale(sphere.fractionConstant, oppositeVec);
        sphere.speed = add(sphere.speed, oppositeVec);
    }
    if (isTopMode)
        camera.viewMatrix = camera.gameTopViewMatrix;
    else {
        var adjustedSphereViewMatrix = mult(translate(0,-0.3,0),camera.gameSphereViewMatrix);
        camera.viewMatrix = adjustedSphereViewMatrix;
    }
};

sphere.collisionDetection = function(){
    var cubeHalfDiagonal = (cube.side / 2) * Math.sqrt(2);
    var a = cubeHalfDiagonal, b = sphere.radius;
    var c = a + b + sphere.radius;
    var halfSide = cube.side / 2;
    var collideStatus = false;
    var sphereFuturePosition = add(sphere.position, sphere.speed);

    for (var k=0;k < cubePosition.length;k++) {
        var curCubePos = cubePosition[k].slice();
        curCubePos[1] = -0.45;
        if(distance(curCubePos, sphereFuturePosition) < c) {
            var frontPoint = add(curCubePos , vec4(0,0,halfSide,0));
            var backPoint = add(curCubePos , vec4(0,0,-halfSide,0));
            var leftPoint = add(curCubePos , vec4(-halfSide,0,0,0));
            var rightPoint = add(curCubePos , vec4(halfSide,0,0,0));
            var sToFront = distance(sphereFuturePosition, frontPoint);
            var sToBack = distance(sphereFuturePosition, backPoint);
            var sToLeft = distance(sphereFuturePosition, leftPoint);
            var sToRight = distance(sphereFuturePosition, rightPoint);

            if (sToFront <= sToBack && sToFront <= sToLeft && sToFront <= sToRight ) {
                if ((sphereFuturePosition[2] - frontPoint[2] ) <= sphere.radius) {
                    sphere.speed[2] = -sphere.speed[2];
                    collideStatus =  true;
                }
            }
            if (sToBack <= sToFront && sToBack <= sToLeft && sToBack <= sToRight ) {
                if((backPoint[2] - sphereFuturePosition[2] ) <= sphere.radius){
                    sphere.speed[2] = -sphere.speed[2];
                    collideStatus =  true;
                }
            }

            if (sToLeft <= sToBack && sToLeft <= sToFront && sToLeft <= sToRight ) {
                if((leftPoint[0] - sphereFuturePosition[0] ) <= sphere.radius) {
                    sphere.speed[0] = -sphere.speed[0];
                    collideStatus =  true;
                }
            }

            if (sToRight < sToBack && sToRight < sToFront && sToRight < sToLeft ) {
                if((sphereFuturePosition[0] - rightPoint[0] ) <= sphere.radius) {
                    sphere.speed[0] = -sphere.speed[0];
                    collideStatus =  true;
                }
            }
        }
    }
    return collideStatus;
};

sphere.roll = function() {
    var axis = cross(sphere.speed, vec4(0,-1,0,0));
    var speed = length(sphere.speed);
    var angleSpeed = speed / sphere.radius *360/Math.PI;
    if(angleSpeed != 0)
        var rollMatrix = rotate(angleSpeed, axis);
    else
        var rollMatrix = mat4();

    sphere.rollMatrix = mult(rollMatrix, sphere.rollMatrix);

};


var basePlane = {
    limit : 0.5,
    coverRange : 20,
    pointsArray : [],
    normalsArray : [],
    ambient : vec4(0.8, 0.8, 0.8, 1.0),
    diffuse : vec4(1.0, 1.0, 1.0, 1.0),
    specular : vec4(1.0, 1.0, 1.0, 1.0),
    shininess : 30.0,
    ambientProduct : vec4(),
    diffuseProduct : vec4(),
    specularProduct : vec4(),
    modelMatrix : mat4(),
    modelViewMatrix : mat4(),
    position : vec4(0,0,0,1),
    vertexNum : 0,
    shadingStyle : 3,
    isPhong : true,
    };

basePlane.init = function(){
    basePlane.modelPointsArray = [ vec4( this.limit,0, this.limit,1),
                                   vec4( this.limit,0,-this.limit,1),
                                   vec4(-this.limit,0, this.limit,1),
                                   vec4(-this.limit,0,-this.limit,1),
                                   vec4(-this.limit,0, this.limit,1),
                                   vec4( this.limit,0,-this.limit,1) ];

    basePlane.modelNormalsArray = [ vec4(0,1,0,0),
                                    vec4(0,1,0,0),
                                    vec4(0,1,0,0),
                                    vec4(0,1,0,0),
                                    vec4(0,1,0,0),
                                    vec4(0,1,0,0) ];

    basePlane.transPoints();
    basePlane.vBuffer = gl.createBuffer();
    basePlane.nBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, basePlane.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(basePlane.pointsArray), gl.STATIC_DRAW);
    gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    gl.bindBuffer(gl.ARRAY_BUFFER,basePlane.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(basePlane.normalsArray),gl.STATIC_DRAW);
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

    basePlane.ambientProduct = mult(basePlane.ambient, light.ambient);
    basePlane.diffuseProduct = mult(basePlane.diffuse, light.diffuse);
    basePlane.specularProduct = mult(basePlane.specular, light.specular);

    basePlane.modelMatrix = mult(translate(0,-0.5,0), basePlane.modelMatrix);
};

basePlane.draw = function() {
    gl.disableVertexAttribArray( vTexCoord);

    gl.bindBuffer( gl.ARRAY_BUFFER, basePlane.vBuffer );
    gl.vertexAttribPointer( vPos, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer( gl.ARRAY_BUFFER, basePlane.nBuffer );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

    gl.uniform4fv( storageObj.ambientProductLoc,flatten(basePlane.ambientProduct) );
    gl.uniform4fv( storageObj.diffuseProductLoc,flatten(basePlane.diffuseProduct) );
    gl.uniform4fv( storageObj.specularProductLoc,flatten(basePlane.specularProduct) );
    gl.uniform1f( storageObj.shininessLoc, basePlane.shininess );
    gl.uniform1i( storageObj.isPhongLoc, basePlane.isPhong );

    basePlane.modelViewMatrix = mult(camera.viewMatrix, basePlane.modelMatrix);
    basePlane.normalMatrix =  transpose(invert4(basePlane.modelViewMatrix));

    gl.uniform4fv(storageObj.spherePositionLoc, flatten(sphere.position));
    gl.uniformMatrix4fv(storageObj.modelMatrixLoc, false, flatten(basePlane.modelMatrix));
    gl.uniformMatrix4fv(storageObj.modelViewMatrixLoc, false, flatten(basePlane.modelViewMatrix) );
    gl.uniformMatrix4fv(storageObj.normalMatrixLoc, false, flatten(basePlane.normalMatrix) );
    gl.uniformMatrix4fv(storageObj.lightModelViewMatrixLoc, false, flatten(sphere.modelViewMatrix));

    gl.uniformMatrix4fv(storageObj.projectionMatrixLoc, false, flatten(camera.projectionMatrix) );

    for( var i=0; i < basePlane.pointsArray.length; i+=3)
        gl.drawArrays(gl.TRIANGLES, i, 3);
};

basePlane.transPoints = function(){
    for(var i = 0 - basePlane.coverRange; i < basePlane.coverRange;i+= 2*basePlane.limit) {
        for(var j = 0 - basePlane.coverRange; j < basePlane.coverRange; j+=2*basePlane.limit) {
            for(var k=0; k < 6; k++){
                basePlane.pointsArray.push(multv(translate(i,0,j),basePlane.modelPointsArray[k]));
                basePlane.normalsArray.push(vec4(0,1,0,0));
            }
        }
    }
};
// light Object
var light = {
    ambient : vec4(1.0, 1.0, 1.0, 1.0 ),
    diffuse :  vec4( 0.0, 0.0, 0.0, 1.0 ),
    specular : vec4(0.0, 0.0, 0.0, 1.0 ),
    position : vec4(0,0,1,1),
    modelMatrix : mat4(),
    modelViewMatrix : mat4()
};

var camera = {
    fovy : 45,
    aspect : 0 ,
    near : 0.3,
    far : 300.0,
    position : vec4(0,0,0,1),
    viewMatrix : mat4(),
    projectionMatrix : mat4(),
    gameSphereViewMatrix : mat4(),
    gameTopViewMatrix : mat4(),
    distanceToSphere : 0.9,

    eye : vec3(),
    at : vec3(),
    up : vec3()
};

var storageObj = new Object();
storageObj.getAllUniformLoc = function(){
    storageObj.sphereModelMatrixLoc = gl.getUniformLocation(program, "sphereModelMatrix");
    storageObj.modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    storageObj.projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    storageObj.normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    storageObj.lightModelViewMatrixLoc = gl.getUniformLocation(program, "lightModelViewMatrix");
    storageObj.ambientProductLoc =  gl.getUniformLocation(program, "ambientProduct");
    storageObj.diffuseProductLoc =  gl.getUniformLocation(program, "diffuseProduct");
    storageObj.specularProductLoc =  gl.getUniformLocation(program, "specularProduct");
    storageObj.positionLoc = gl.getUniformLocation(program, "lightPosition");
    storageObj.shininessLoc =  gl.getUniformLocation(program, "shininess");
    storageObj.isPhongLoc =  gl.getUniformLocation(program, "isPhong");
    storageObj.spherePositionLoc = gl.getUniformLocation(program, "spherePosition");
    storageObj.modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
};


function triangle(a, b, c, n) {
    sphere.pointsArray.push(a);
    sphere.pointsArray.push(b);
    sphere.pointsArray.push(c);
    sphere.vertexNum += 3;

    sphere.normalsArray.push(vec4(a[0],a[1], a[2], 0.0));
    sphere.normalsArray.push(vec4(b[0],b[1], b[2], 0.0));
    sphere.normalsArray.push(vec4(c[0],c[1], c[2], 0.0));
}

function recursiveTriangle(a, b, c, count, n) {
    if ( count > 0 ) {
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
        recursiveTriangle( a, ab, ac, count - 1, n);
        recursiveTriangle( ab, b, bc, count - 1, n );
        recursiveTriangle( bc, c, ac, count - 1, n );
        recursiveTriangle( ab, bc, ac, count - 1, n );
    }
    else
        triangle( a, b, c, n );
}

function tetrahedron(a, b, c, d, n) {
    recursiveTriangle(a, b, c, sphere.complexity,n);
    recursiveTriangle(d, c, b, sphere.complexity,n);
    recursiveTriangle(a, d, b, sphere.complexity,n);
    recursiveTriangle(a, c, d, sphere.complexity,n);
}

function generateSpheres(){
    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);
    tetrahedron(va,vb,vc,vd,0);
    sphere.ambientProduct = mult(sphere.ambient, light.ambient);
    sphere.diffuseProduct = mult(sphere.diffuse, light.diffuse);
    sphere.specularProduct = mult(sphere.specular, light.specular);
}

function quad(a, b, c, d) {
    cube.pointsArray.push(cube.vertices[a]);
    cube.pointsArray.push(cube.vertices[b]);
    cube.pointsArray.push(cube.vertices[c]);
    cube.pointsArray.push(cube.vertices[a]);
    cube.pointsArray.push(cube.vertices[c]);
    cube.pointsArray.push(cube.vertices[d]);
    cube.texCoordsArray.push(cube.texCoord[0]);
    cube.texCoordsArray.push(cube.texCoord[1]);
    cube.texCoordsArray.push(cube.texCoord[2]);
    cube.texCoordsArray.push(cube.texCoord[0]);
    cube.texCoordsArray.push(cube.texCoord[2]);
    cube.texCoordsArray.push(cube.texCoord[3]);
}

function storeNormal(face) {
    switch (face) {
        case 'front':
            for (var i = 0; i < 6; i++)
                cube.normalsArray.push(vec4(0,0,-1,0));
            break;

        case 'back':
            for (var i = 0; i < 6; i++)
                cube.normalsArray.push(vec4(0,0,1,0));
            break;
        case 'left':
            for (var i = 0; i < 6; i++)
                cube.normalsArray.push(vec4(-1,0,0,0));
            break;
        case 'right':
            for (var i = 0; i < 6; i++)
                cube.normalsArray.push(vec4(1,0,0,0));
            break;
        case 'top':
            for (var i = 0; i < 6; i++)
                cube.normalsArray.push(vec4(0,1,0,0));
            break;
        case 'bottom':
            for (var i = 0; i < 6; i++)
                cube.normalsArray.push(vec4(0,-1,0,0));
            break;
    }
}

function drawCube() {
    quad( 1, 0, 3, 2 );
    storeNormal('front');
    quad( 2, 3, 7, 6 );
    storeNormal('right');
    quad( 4, 0, 3, 7 );
    storeNormal('bottom');
    quad( 5, 1, 2, 6 );
    storeNormal('top');
    quad( 6, 7, 4, 5 );
    storeNormal('back');
    quad( 5, 4, 0, 1 );
    storeNormal('left');
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl )
        alert( "WebGL isn't available" );
    gl.viewport(0, 0, canvas.width, canvas.height);
    camera.aspect =  canvas.width/canvas.height;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    vPos = gl.getAttribLocation( program, "vPosition" );
    vNormal = gl.getAttribLocation( program, "vNormal" );
    translateMaze(maze);
    cube.init();
    sphere.init();
    basePlane.init();
    storageObj.getAllUniformLoc()
    camera.projectionMatrix = perspective(camera.fovy, camera.aspect, camera.near, camera.far);
    render();
};
function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    sphere.draw();
    basePlane.draw();
    for (var i = 0; i < cubePosition.length; i++) {
        cube.draw(cubePosition[i], cube.texture[18]);
    }
    cube.makeLargeCube();
    setTimeout(function (){requestAnimFrame(render);}, 1000/60 );
}

window.onkeydown = function(event){
    if(!isTopMode) {
        var currentDirc = subtract(sphere.position, camera.position);
        currentDirc = vscale(1/100,normalize(currentDirc));
        var tempSpeed;
        switch(event.keyCode){
            case 87 :
                tempSpeed = add(sphere.speed, currentDirc);
                if(length(tempSpeed) <= sphere.topSpeed)
                sphere.speed = tempSpeed;
                break;
            case 83 :
                tempSpeed = add(sphere.speed, negate(currentDirc));
                if(length(tempSpeed) <= sphere.topSpeed)
                sphere.speed = tempSpeed;
                break;
            case 65 :
                var currentLeft = negate(cross(currentDirc,vec4(0,1,0,0)));
                tempSpeed = add(sphere.speed, vec4(currentLeft,0));
                if(length(tempSpeed) <= sphere.topSpeed)
                sphere.speed = tempSpeed;
                break;
            case 68 :
                var currentRight = cross(currentDirc,vec4(0,1,0,0));
                tempSpeed = add(sphere.speed, vec4(currentRight,0));
                if(length(tempSpeed) <= sphere.topSpeed)
                sphere.speed = tempSpeed;
                break;
            case 37:
                var v3SpherePosition = v4ToV3(sphere.position);
                var v3CameraPosition = v4ToV3(camera.position);
                var sphereToCameraVec = subtract(v3CameraPosition,v3SpherePosition);
                var v3Vertical = vec3(0,1,0);
                var v3Cross = cross(sphereToCameraVec,v3Vertical);
                v3Cross = normalize(v3Cross);
                v3Cross = vscale(0.08,v3Cross);
                var newSphereToCamera = add(sphereToCameraVec, v3Cross);
                newSphereToCamera = normalize(newSphereToCamera);

                newSphereToCamera = vscale(camera.distanceToSphere,newSphereToCamera);
                camera.eye = add(v3SpherePosition, newSphereToCamera);
                camera.position = vec4(camera.eye, 1);
                break;
            case 39:
                var v3SpherePosition = v4ToV3(sphere.position);
                var v3CameraPosition = v4ToV3(camera.position);
                var sphereToCameraVec = subtract(v3CameraPosition,v3SpherePosition);
                var v3Vertical = vec3(0,1,0);
                var v3Cross = cross(sphereToCameraVec,v3Vertical);
                v3Cross = normalize(v3Cross);
                v3Cross = negate(vscale(0.08,v3Cross));
                var newSphereToCamera = add(sphereToCameraVec, v3Cross);
                newSphereToCamera = normalize(newSphereToCamera);

                newSphereToCamera = vscale(camera.distanceToSphere,newSphereToCamera);
                camera.eye = add(v3SpherePosition, newSphereToCamera);
                camera.position = vec4(camera.eye, 1);
                break;
            case 84:
                isTopMode = true;
                break;
            case 82:
                sphere.speed = vec4(0,0,0,0);
                sphere.modelMatrix = mult(scale(sphere.radius,sphere.radius,sphere.radius),mat4());
                sphere.modelMatrix = mult(translate(2.7,-0.45,1.0), sphere.modelMatrix);
                sphere.position = vec4(2.7,-0.45,1.0);
                camera.position = add(sphere.position, vec4(camera.distanceToSphere,0,0,0));
                camera.eye = v4ToV3(camera.position);
                camera.at = v4ToV3(sphere.position);
                camera.up = vec3(0,1,0);
                break;
        }
        camera.gameSphereViewMatrix = lookAt(camera.eye, camera.at, camera.up);
    }
    else {
        var currentDirc = vec4(0,0,1,0);
        currentDirc = vscale(1/100,normalize(currentDirc));
        switch(event.keyCode) {
            case 87 :
                tempSpeed = add(sphere.speed, currentDirc);
                if(length(tempSpeed) <= sphere.topSpeed)
                sphere.speed = tempSpeed;
                break;
            case 83 :
                tempSpeed = add(sphere.speed, negate(currentDirc));
                if(length(tempSpeed) <= sphere.topSpeed)
                sphere.speed = tempSpeed;
                break;
            case 65 :
                var currentLeft = negate(cross(currentDirc,vec4(0,1,0,0)));
                tempSpeed = add(sphere.speed, vec4(currentLeft,0));
                if(length(tempSpeed) <= sphere.topSpeed)
                sphere.speed = tempSpeed;
                break;
            case 68 :
                var currentRight = cross(currentDirc,vec4(0,1,0,0));
                tempSpeed = add(sphere.speed, vec4(currentRight,0));
                if(length(tempSpeed) <= sphere.topSpeed)
                sphere.speed = tempSpeed;
                break;
            case 84:
                isTopMode = false;
                break;
            case 82:
                sphere.speed = vec4(0,0,0,0);
                sphere.modelMatrix = mult(scale(sphere.radius,sphere.radius,sphere.radius),mat4());
                sphere.modelMatrix = mult(translate(2.7,-0.45,1.0), sphere.modelMatrix);
                sphere.position = vec4(2.7,-0.45,1.0);
                camera.position = add(sphere.position, vec4(camera.distanceToSphere,0,0,0));
                camera.eye = v4ToV3(camera.position);
                camera.at = v4ToV3(sphere.position);
                camera.up = vec3(0,1,0);
                break;
        }
    }
    if (isTopMode)
        camera.viewMatrix = camera.gameTopViewMatrix;
    else {
        var adjustedSphereViewMatrix = mult(translate(0,-0.1,0),camera.gameSphereViewMatrix);
        camera.viewMatrix = adjustedSphereViewMatrix;
    }
};