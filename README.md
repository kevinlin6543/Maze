# Maze Project

A project Developed in webGL by Kevin Lin

## Running Project

Run in Firefox, Internet Edge and any other webGL supported browser. The only browser with a bug at the moment is Google Chrome


## Aspects of the project
Built on top of the textbook's provided MV.js file.

### Lighting & Shading
The Phong model is used for lighting and shading. The player which is currently a ball has a light source that is used to calculated color of the nearby objects. The code was based off the textbook's example.

#### Vertex Shader

```javascript

varying vec3 N, L, E, H;

E = normalize(-pos);
N = normalize( (normalMatrix*vNormal).xyz);
H = normalize(L + E);

vec4 ambient = vec4(0,0,0,1);

float Kd = max( dot(L, N), 0.0 );
vec4  diffuse = Kd*diffuseProduct;
float Ks = pow( max(dot(N, H), 0.0), shininess );
vec4  specular = Ks * specularProduct;
if( dot(L, N) < 0.0 )
    specular = vec4(0.0, 0.0, 0.0, 1.0);
fColor = ambient + diffuse +specular;
```

#### Fragment Shader

```javascript
uniform vec4 ambientProduct;
uniform vec4 diffuseProduct;
uniform vec4 specularProduct;
varying vec3 N, L, E, H;

vec4 fColorTemp;
vec4 ambient = ambientProduct;
float Kd = max( dot(L, N), 0.0 );
vec4  diffuse = Kd*diffuseProduct;
float Ks = pow( max(dot(N, H), 0.0), shininess );
vec4  specular = Ks * specularProduct;
if( dot(L, N) < 0.0 )
    specular = vec4(0.0, 0.0, 0.0, 1.0);
fColorTemp = ambient + diffuse +specular;
fColorTemp.a = 1.0;
gl_FragColor = fColorTemp;

```

### Texturing

The objects that are textured are the walls and the skybox.  The skybox uses a generic light blue with white and the walls are stones. The texture image were embedded into the html file with the hidden flag. This allowed proper import of the jpg files

#### Vertex Shader

```javascript
attribute vec2 vTexCoord;
varying vec2 fTexCoord;

fTexCoord = 1.0 * vTexCoord;
```


#### Fragment Shader

```javascript
uniform sampler2D texture;
varying vec4 fColor;
varying vec2 fTexCoord;
if (distance < 3.5){
    float coef = 1.0 / pow(distance,3.0);
    if(coef > 1.0)
        coef = 1.0;
    gl_FragColor = coef * texture2D(texture, fTexCoord);
}
else if(distance > 50.0)
    gl_FragColor = texture2D(texture, fTexCoord);
else
    gl_FragColor = vec4(0.0,0.0,0.0,1.0);
```

### Collision Detection
Collisions were detected by using the sphere's speed and calculating the future position of the sphere on each side of the sphere while keeping the maximum width of the sphere in the calculations

```javascript
sphere.collisionDetection = function(){
    ...

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
    return collideStatus;
};
```

## Playing the Maze
### Controls
```
W : Forward
A : Left
S : Backward
D : Right
T : Top-view
<-: Turn Right
->: Turn Left

```