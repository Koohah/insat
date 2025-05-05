import * as THREE from './three.module.js';
import {OrbitControls} from './other/OrbitControls.js';
import {GLTFLoader} from './other/GLTFLoader.js';
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.144/build/three.module.js';
// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.144/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.144/examples/jsm/loaders/GLTFLoader.js';


const DrakkarUrl = new URL('../medias/drakkar.glb', import.meta.url);
const GreksUrl = new URL('../medias/ile_greks_2.glb', import.meta.url);
const LCloudUrl = [
    new URL('../medias/low_poly_cloud.glb', import.meta.url),
    new URL('../medias/cloud1.glb', import.meta.url),
    new URL('../medias/cloud2.glb', import.meta.url),
    new URL('../medias/cloud3.glb', import.meta.url),
    new URL('../medias/cloud4.glb', import.meta.url)
]; 


// Initialisation de la scene

const renderer = new THREE.WebGLRenderer({ antialias: true  }); // consomme un peu mais c'est plus beau
renderer.shadowMap.enabled = true;

const sceneContainer = document.getElementById('sceneContainer');


renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight); // toute la page
renderer.setPixelRatio(window.devicePixelRatio);
sceneContainer.appendChild(renderer.domElement); // canvas

const scene = new THREE.Scene();    // Creation de la scene


// Camera

const camera = new THREE.PerspectiveCamera(75, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 1000); // Fov 75, de la taille de la fenetre
const orbit = new OrbitControls(camera, renderer.domElement);   // On lui donne des commandes de deplacement

// Parametres de Camera

orbit.enableDamping = true; 
orbit.dampingFactor = 0.035;        // Inertie
orbit.enablePan = false;            // Pas de deplacements
orbit.maxDistance = 10;
orbit.minDistance = 5;              // Zoom
orbit.maxPolarAngle = 3*Math.PI/4;  
orbit.minPolarAngle = Math.PI/4;    // Hauteur Max et Min
camera.position.set(4.5, 2.5, 4.5);
orbit.update();                     // Toujours update apres

window.addEventListener('resize', function() {
    const containerWidth = sceneContainer.clientWidth;
    const containerHeight = sceneContainer.clientHeight;

    // Update camera aspect ratio
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(containerWidth, containerHeight);
});

// Aides

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(30, 30);
scene.add(gridHelper);


// Fonction pour orbiter la planete que l'on va creer
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
const rCoords = (r) => {   //Coordonnees aleatoires autour de la planete
    const theta = Math.random() * 2 * Math.PI; // Longitude (0 a 2pi)
    const phi = Math.random() * Math.PI; // Latitude (0 a 2pi)
    const x = r*Math.sin(phi)*Math.sin(theta);
    const y = r*Math.cos(phi);
    const z = r*Math.sin(phi)*Math.cos(theta);
    return new THREE.Vector3(x, y, z);
}; // Ca marche je n'y touche plus


// Creation de la Planete

const planetGeo = new THREE.IcosahedronGeometry(3, 1);  // Geometrie de la planete
const planetMat = new THREE.MeshStandardMaterial({
    color: 0x1045c5, // bleu
    metalness: 0.5,
    roughness: 1
}); // Sa texture
const planet = new THREE.Mesh(planetGeo, planetMat);    // Creation
scene.add(planet);  // Toujours ajouter a la scene
planet.receiveShadow = true;    // Recoit des ombres

// "Sharper Edges"
const pWireGeo = new THREE.IcosahedronGeometry(3.005, 1); // Geometrie des aretes, attention aux clip
const pWireMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.15
}); // Leur texture
const pWire = new THREE.Mesh(pWireGeo, pWireMat);   // Creation
planet.add(pWire);

// Atmosphere
const atmoGeo = new THREE.SphereGeometry(4);    // Geometrie spherique
const atmoMat = new THREE.MeshStandardMaterial({
    color: 0x088ff8,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.2
}); // Sa texture, on voit la face interieure
const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);    // Creation
scene.add(atmosphere);


// Creation de l'Etoile

const starGeo = new THREE.IcosahedronGeometry(10, 3);
const starMat = new THREE.MeshBasicMaterial({
    color: 0xf0ca55,
    side: THREE.BackSide
});
const star = new THREE.Mesh(starGeo, starMat);
const starObj = new THREE.Object3D();
starObj.add(star);
scene.add(starObj);
star.position.x = 40;
const sWireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.2
});
const sWire = new THREE.Mesh(starGeo, sWireMat);
star.add(sWire);

// Coeur de l'etoile
const sHeartGeo = new THREE.IcosahedronGeometry(5, 4);
const sHeartMat = new THREE.MeshBasicMaterial({
    color: 0xff3900,
    side: THREE.FrontSide
});
const starHeart = new THREE.Mesh(sHeartGeo, sHeartMat);
starObj.add(starHeart);
starHeart.position.x = 40;
const shWireMat = new THREE.MeshBasicMaterial({
    color: 0x990000,
    wireframe: true,
    transparent: true,
    opacity: 0.9
});
const shWire = new THREE.Mesh(sHeartGeo, shWireMat);
star.add(shWire);

// Millieu de l'etoile
const sMiddleGeo = new THREE.IcosahedronGeometry(7.5, 4);
const sMiddleMat = new THREE.MeshBasicMaterial({
    color: 0xefaf12,
    side: THREE.BackSide
});
const starMiddle = new THREE.Mesh(sMiddleGeo, sMiddleMat);
starObj.add(starMiddle);
starMiddle.position.x = 40;
const smWireMat = new THREE.MeshBasicMaterial({
    color: 0xf08c2c,
    wireframe: true,
    transparent: true,
    opacity: 0.6
});
const smWire = new THREE.Mesh(sMiddleGeo, smWireMat);
star.add(smWire);


// Lumieres

// Lumiere ambiante
const ambientLight = new THREE.AmbientLight(0xa9a9a9); // sombre
scene.add(ambientLight);
// Lumiere de l'etoile
const starLight = new THREE.DirectionalLight(0xffffff, 3);
starLight.castShadow = true;    // Projete des ombres
star.add(starLight);



// const spotLight = new THREE.SpotLight(0xffffff, 10);
// scene.add(spotLight);
// spotLight.position.set(-100, 100, 0);
// spotLight.castShadow =  true;
// spotLight.angle = 0.2;

// const sLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(sLightHelper);

// const directionnalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// scene.add(directionnalLight);
// directionnalLight.position.set(-30, 50, 0);
// directionnalLight.castShadow = true;
// directionnalLight.shadow.camera.bottom = -12;

// const dLightHelper = new THREE.DirectionalLightHelper(starLight, 5);
// scene.add(dLightHelper);
// const dLightShadowHelper = new THREE.CameraHelper(starLight.shadow.camera)
// scene.add(dLightShadowHelper);


// Modeles 3D

const gltfLoader = new GLTFLoader();   // Ce qui charge les modeles 3D
// Premier modele
let Drakkar = null;
let DrakkarPivot = null;
gltfLoader.load(DrakkarUrl.href, (gltf) => {
    gltf.scene.position.set(0, 0, 0);
    Drakkar = gltf.scene;
    Drakkar.scale.set(0.1, 0.1, 0.1);
    const vec = new THREE.Vector3(
        Math.cos(Math.PI/4.5)*2.85,
        Math.sin(Math.PI/4.5)*2.85,
        0
    ); // Placement sur la sphere, angle * rayon
    setupOrbit(vec, Drakkar);
    DrakkarPivot = new THREE.Object3D();
    DrakkarPivot.add(Drakkar);
    planet.add(DrakkarPivot);
}, undefined, function(error) {
    console.error(error);
});

// Deuxieme modele
let Greks = null;
let GreksPivot = null;
gltfLoader.load(GreksUrl.href, (gltf) => {
    gltf.scene.position.set(0, 0, 0);
    Greks = gltf.scene;
    Greks.scale.set(0.5, 0.5, 0.5);
    const vec = new THREE.Vector3(
        Math.cos(Math.PI*6.6/8)*3.6,
        Math.sin(Math.PI*6.6/8)*3.6,
        0
    ); // Placement sur la sphere, angle * rayon
    // console.log(vec);
    setupOrbit(vec, Greks);
    // console.log(Greks.position);
    // Ajustements de merde parce que le modele n'est pas au centre de la scene -> changer de modele
    Greks.position.x += -1.4;
    Greks.position.y += -1.3;
    Greks.position.z += -1.8;
    Greks.rotation.z += 0.06;
    // console.log(Greks.position);
    GreksPivot = new THREE.Object3D();
    GreksPivot.add(Greks);
    planet.add(GreksPivot);
}, undefined, function(error) {
    console.error(error);
});

//Nuages

const cloudsGroup = new THREE.Group();
const generateClouds = (cNbr) => { // Fonction generer les nuages
    const vecList = []; // Initialisation de la liste des vecteurs positions autour de la planete
    const cCorrect = new THREE.Vector3(0, 0, 0);
    for (let c=0; c<cNbr; c++) {
        let Cloud = null;
        let CloudPivot = null;
        let cVec = null;    // Initialisation d'un vecteur deplacement
        let correct = false; // Incorect tant que non verifie
        while (!correct) {
            cVec = rCoords(3.5);    // Position aleatoire autour de la planete
            correct = true; // On suppose qu'il est bon
            for (let i = 0; i < vecList.length; i++) {
                if (cVec.distanceTo(vecList[i]) < 2) {
                    correct = false; // Si trop proche d'un autre, on recommence
                    vecList.push(cVec);
                };
            };
        };
        gltfLoader.load(LCloudUrl[c%5].href, (gltf) => {
            Cloud = gltf.scene;
            Cloud.position.set(0, 0, 0);
            Cloud.scale.set(0.05, 0.05, 0.05);
            setupOrbit(cVec, Cloud, cCorrect);
            CloudPivot = new THREE.Object3D();
            CloudPivot.add(Cloud);
            cloudsGroup.add(CloudPivot);   // Ajout du nuage dans le groupe des nuages
        }, undefined, function(error) {
            console.error(error);
        });

    };
};
generateClouds(30); // Appel de la fonction
scene.add(cloudsGroup); // Ajout des nuages a la scene
cloudsGroup.castShadow = true;  // Cree des ombres


camera.lookAt(planet.position)



// Animation

const animate = (time) => {
    time *= 0.001;
    planet.rotation.y += 0.001; // Rotation du groupe planete sur son axe
    starObj.rotation.y += 0.00015;  // Revolution de l'etoile autour de la planete
    star.rotation.y += 0.0005;  // Rotation de l'etoile sur son axe
    cloudsGroup.rotation.y += 0.00025; // Moins vite que la planete
    renderer.render(scene, camera);
    orbit.update()

};

renderer.setAnimationLoop(animate);


// const hud = document.getElementById('hud');
// const toggleButton = document.getElementById('hudToggleButton');
// let visibleHUD = true;

// toggleButton.addEventListener('click', () => {
//     visibleHUD = !visibleHUD;
//     hud.style.display = visibleHUD ? 'block' : 'none';
//     toggleButton.textContent = visibleHUD ? 'Cacher le HUD' : 'Afficher le HUD';
// });




// Anciens nuages

// const cloudsGroup = new THREE.Group();
// const generateClouds = (cNbr) => { // Fonction generer les nuages
//     const vecList = []; // Initialisation de la liste des vecteurs positions autour de la planete
//     const cMat = new THREE.MeshStandardMaterial({
//         color: 0xffffff,
//         transparent: true,
//         side: THREE.FrontSide,
//         opacity: 0.6
//     }); // Leur Texture
//     for (let c=0; c<cNbr; c++) {
//         let localCGroup  = new THREE.Group(); // Le groupe des formes d'un nuage
//         for (let n=0; n<7; n++) {   // Le nombre de spheres dans le nuage
//             const cSphereGeo = new THREE.SphereGeometry(0.3);   // Une forme
//             const cSphere = new THREE.Mesh(cSphereGeo, cMat);   // Creation de la forme
//             // Position aleatoire dans le groupe de nuage
//             let factor1 = (Math.random()-0.5)*0.7;
//             let factor2 = (Math.random()-0.5)*0.8;
//             cSphere.position.x = factor1;
//             cSphere.position.y = (factor1-factor2)/4;
//             cSphere.position.z = factor2;
//             localCGroup.add(cSphere)    // Ajout des formes dans le groupe
//         };
//         let vec;    // Initialisation d'un vecteur deplacement
//         let correct = false // Incorect tant que non verifie
//         while (!correct) {
//             vec = rCoords();    // Position aleatoire autour de la planete
//             correct = true; // On suppose qu'il est bon
//             for (let i = 0; i < vecList.length; i++) {
//                 if (vec.distanceTo(vecList[i]) < 1) {
//                     correct = false; // Si trop proche d'un autre, on recommence
//                     break;
//                 };
//             };
//         };
//         vecList.push(vec);  // Ajout du vecteur dans la liste
//         setupOrbit(vec, localCGroup);   // Orbite des nuages
//         cloudsGroup.add(localCGroup);   // Ajout du nuage dans le groupe des nuages
//     };
// };
// generateClouds(22); // Appel de la fonction
// scene.add(cloudsGroup); // Ajout des nuages a la scene
// cloudsGroup.castShadow = true;  // Cree des ombres