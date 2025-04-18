import * as THREE from '../../js/three.module.js';
import {OrbitControls} from '../../js/other/OrbitControls.js';
import {GLTFLoader} from '../../js/other/GLTFLoader.js';

const DrakkarUrl = new URL('../../medias/drakkar.glb', import.meta.url);
const GreksUrl = new URL('../../medias/ile_greks_2.glb', import.meta.url);
const CloudUrl = new URL('../../medias/low_poly_cloud.glb', import.meta.url);
console.log(DrakkarUrl, GreksUrl, CloudUrl);



const setupOrbit = (Vec = new THREE.Vector3(), obj, correct = new THREE.Vector3()) => {
    // Recentrer l'objet sur son centre géométrique
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(correct);
    obj.position.sub(center); // recentre localement
    obj.updateMatrixWorld(true); // applique
    // Placer l'objet à la position désirée (surface sphère)
    const up = new THREE.Vector3(0, 1, 0);
    const normal = Vec.clone().normalize();
    obj.quaternion.setFromUnitVectors(up, normal);
    obj.position.copy(Vec);
    
    // Faire "regarder" l'objet vers le centre (origine)
    // obj.lookAt(0, 0, 0);
};
const rCoords = () => {   //Coordonnees aleatoires autour de la planete
    const theta = Math.random() * 2 * Math.PI; // Longitude (0 a 2pi)
    const phi = Math.random() * 2 * Math.PI; // Latitude (0 a 2pi)
    const x = 3*Math.sin(theta);
    const y = 3*Math.sin(phi);
    const z = 3*Math.cos(theta);
    return new THREE.Vector3(x, y, z);
}; // Ca marche je n'y touche plus



// Initialisation de la scene

const renderer = new THREE.WebGLRenderer({ antialias: true  }); // consomme un peu mais c'est plus beau
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight); // toute la page
document.body.appendChild(renderer.domElement); // canvas

const scene = new THREE.Scene();    // Creation de la scene


// Camera

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Fov 75, de la taille de la fenetre
const orbit = new OrbitControls(camera, renderer.domElement);   // On lui donne des commandes de deplacement


// Parametres de Camera

orbit.enableDamping = true; 
orbit.dampingFactor = 0.035;        // Inertie
// orbit.maxDistance = 10;
// orbit.minDistance = 5;              // Zoom
camera.position.set(4.5, 2.5, 4.5);
orbit.update();                     // Toujours update apres


// Aides

const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(30, 30);
scene.add(gridHelper);


// Lumiere

const ambientLight = new THREE.AmbientLight(0xd1d1d1); // sombre
scene.add(ambientLight);

const Light = new THREE.DirectionalLight(0xffffff, 3);
Light.castShadow = true;    // Projete des ombres
scene.add(Light);

// Initialisation modeles

const gltfLoader = new GLTFLoader();   // Ce qui charge les modeles 3D
// Premier modele
// let Drakkar = null;
// let DrakkarObj = null;
// gltfLoader.load(DrakkarUrl.href, (gltf) => {
//     Drakkar = gltf.scene;
//     Drakkar.position.set(0, 0, 0);
//     Drakkar.scale.set(0.1, 0.1, 0.1);
//     DrakkarObj = new THREE.Object3D();
//     DrakkarObj.add(Drakkar);
//     scene.add(DrakkarObj);
// });
let cCorrect = null;
let cVec = null;
let Cloud = null;
let CloudObj = null;
gltfLoader.load(CloudUrl.href, (gltf) => {
    cCorrect = new THREE.Vector3(-1, 0, 1.25);
    Cloud = gltf.scene;
    Cloud.scale.set(0.025, 0.025, 0.025);
    cVec = rCoords();
    console.log(cVec);
    setupOrbit(cVec, Cloud);
    CloudObj = new THREE.Object3D();
    CloudObj.add(Cloud);
    CloudObj.castShadow = true;
    scene.add(CloudObj);
});



const animate = () => {
    renderer.render(scene, camera);
    orbit.update()
};

renderer.setAnimationLoop(animate);