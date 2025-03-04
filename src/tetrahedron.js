import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const vertices = [
    [1, 1, 1],
    [-1, -1, 1],
    [-1, 1, -1],
    [1, -1, -1]
].map(v => new THREE.Vector3(...v));

const faces = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3]
];

const geometry = new THREE.BufferGeometry();
const positions = [];
faces.forEach(f => {
    positions.push(...vertices[f[0]].toArray());
    positions.push(...vertices[f[1]].toArray());
    positions.push(...vertices[f[2]].toArray());
});
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

const vertexColors = [
    new THREE.Color(0x00ffff),
    new THREE.Color(0xff00ff),
    new THREE.Color(0xffff00),
    new THREE.Color(0x00ff00) 
];

const colors = [];
faces.forEach(f => {
    colors.push(...vertexColors[f[0]].toArray());
    colors.push(...vertexColors[f[1]].toArray());
    colors.push(...vertexColors[f[2]].toArray());
});

geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

const material = new THREE.MeshBasicMaterial({ 
    vertexColors: true,
    wireframe: false, 
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
});

const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});

const tetrahedron = new THREE.Mesh(geometry, material);
const wireframeTetrahedron = new THREE.Mesh(geometry.clone(), wireframeMaterial);
tetrahedron.add(wireframeTetrahedron);
scene.add(tetrahedron);

scene.background = new THREE.Color(0x121212);

camera.position.z = 4;

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

const axisGeometry = new THREE.BufferGeometry();
const axisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const axisLine = new THREE.Line(axisGeometry, axisMaterial);
axisLine.visible = false;
scene.add(axisLine);

axisMaterial.color.set(0xff3355);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const rotationAxes = [
    // For the 120° rotations (2*PI/3)
    new THREE.Vector3(1, 1, 1).normalize(),
    new THREE.Vector3(-1, 1, 1).normalize(),
    new THREE.Vector3(1, -1, 1).normalize(),
    new THREE.Vector3(1, 1, -1).normalize(),
    // For the -120° rotations (-2*PI/3)
    new THREE.Vector3(1, 1, 1).normalize(),
    new THREE.Vector3(-1, 1, 1).normalize(), 
    new THREE.Vector3(1, -1, 1).normalize(),
    new THREE.Vector3(1, 1, -1).normalize(),
    // For the 180° rotations (PI)
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 1)
];

const rotations = [
    // 120° rotations (2*PI/3)
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[0], 2 * Math.PI / 3),
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[1], 2 * Math.PI / 3),
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[2], 2 * Math.PI / 3),
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[3], 2 * Math.PI / 3),
    // -120° rotations (-2*PI/3)
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[4], -2 * Math.PI / 3),
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[5], -2 * Math.PI / 3),
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[6], -2 * Math.PI / 3),
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[7], -2 * Math.PI / 3),
    // 180° rotations (PI)
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[8], Math.PI),
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[9], Math.PI),
    new THREE.Quaternion().setFromAxisAngle(rotationAxes[10], Math.PI)
];

let currentRotation = 0;
let targetQuaternion = new THREE.Quaternion();
let rotationCount = 0;
let isRotating = false;

const counterDisplay = document.createElement("div");
counterDisplay.innerText = `Rotations: ${rotationCount}`;
counterDisplay.style.position = "absolute";
counterDisplay.style.top = "50px";
counterDisplay.style.left = "10px";
counterDisplay.style.padding = "10px";
counterDisplay.style.background = "white";
document.body.appendChild(counterDisplay);

function updateAxisLine(axisIndex) {
    if (axisIndex >= 0 && axisIndex < rotationAxes.length) {
        const axis = rotationAxes[axisIndex];
        
        const lineLength = 5;
        const startPoint = axis.clone().multiplyScalar(-lineLength);
        const endPoint = axis.clone().multiplyScalar(lineLength);
        
        const points = [startPoint, endPoint];
        axisGeometry.setFromPoints(points);
        
        axisGeometry.attributes.position.needsUpdate = true;
    }
}

function getAxisIndexForRotation(rotationIndex) {
    return rotationIndex;
}

updateAxisLine(getAxisIndexForRotation(currentRotation));
axisLine.visible = true;

function animate() {
    requestAnimationFrame(animate);
    if (isRotating) {
        tetrahedron.quaternion.slerp(targetQuaternion, 0.1);
        
        if (tetrahedron.quaternion.angleTo(targetQuaternion) < 0.01) {
            tetrahedron.quaternion.copy(targetQuaternion);
            isRotating = false;
            rotationCount++;
            counterDisplay.innerText = `Rotations: ${rotationCount}`;
            
            tetrahedron.quaternion.identity();
            
            if (rotationCount >= 12) {
                rotationCount = 0;
                currentRotation = 0;
                counterDisplay.innerText = `Rotations: ${rotationCount}`;
            } else {
                currentRotation = (currentRotation + 1) % rotations.length;
            }
            
            updateAxisLine(getAxisIndexForRotation(currentRotation));
        }
    }
    renderer.render(scene, camera);
}
animate();

targetQuaternion.copy(rotations[currentRotation]);
const button = document.createElement("button");
button.innerText = "Rotate";
button.style.position = "absolute";
button.style.top = "10px";
button.style.left = "10px";
button.style.padding = "10px";
document.body.appendChild(button);

button.addEventListener("click", () => {
    if (!isRotating) {
        isRotating = true;
        targetQuaternion.copy(rotations[currentRotation]);
    }
});

const styleUI = () => {
    counterDisplay.style.fontFamily = "'Roboto', Arial, sans-serif";
    counterDisplay.style.color = "#ffffff";
    counterDisplay.style.background = "rgba(30, 30, 30, 0.8)";
    counterDisplay.style.borderRadius = "8px";
    counterDisplay.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.5)";
    counterDisplay.style.fontSize = "16px";
    counterDisplay.style.fontWeight = "500";
    counterDisplay.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    
    button.style.fontFamily = "'Roboto', Arial, sans-serif";
    button.style.fontSize = "16px";
    button.style.fontWeight = "500";
    button.style.color = "#ffffff";
    button.style.background = "linear-gradient(135deg, #00bcd4, #673ab7)";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.boxShadow = "0 0 15px rgba(102, 51, 153, 0.7)";
    button.style.cursor = "pointer";
    button.style.transition = "all 0.3s ease";
    button.style.padding = "12px 20px";
    
    button.onmouseover = () => {
        button.style.transform = "translateY(-2px)";
        button.style.boxShadow = "0 0 25px rgba(102, 51, 153, 0.9)";
    };
    
    button.onmouseout = () => {
        button.style.transform = "translateY(0)";
        button.style.boxShadow = "0 0 15px rgba(102, 51, 153, 0.7)";
    };
    
    button.onmousedown = () => {
        button.style.transform = "translateY(1px)";
        button.style.boxShadow = "0 0 10px rgba(102, 51, 153, 0.5)";
    };
    
    button.onmouseup = () => {
        button.style.transform = "translateY(-2px)";
        button.style.boxShadow = "0 0 25px rgba(102, 51, 153, 0.9)";
    };
}

styleUI();

axesHelper.material.color.set(0xffffff);
