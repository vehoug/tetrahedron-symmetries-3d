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

const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
const tetrahedron = new THREE.Mesh(geometry, material);
scene.add(tetrahedron);

camera.position.z = 4;

const controls = new OrbitControls(camera, renderer.domElement);

const rotationAxes = [
    new THREE.Vector3(1, 1, 1).normalize(),
    new THREE.Vector3(-1, 1, 1).normalize(),
    new THREE.Vector3(1, -1, 1).normalize(),
    new THREE.Vector3(1, 1, -1).normalize(),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 1)
];

const rotations = rotationAxes.flatMap(axis => [
    new THREE.Quaternion().setFromAxisAngle(axis, 2 * Math.PI / 3),
    new THREE.Quaternion().setFromAxisAngle(axis, -2 * Math.PI / 3)
]);
rotations.push(
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)
);

let currentRotation = 0;
let targetQuaternion = new THREE.Quaternion();

function animate() {
    requestAnimationFrame(animate);
    tetrahedron.quaternion.slerp(targetQuaternion, 0.1);
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
    targetQuaternion.copy(rotations[currentRotation]);
    currentRotation = (currentRotation + 1) % rotations.length;
});
