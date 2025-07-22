import * as THREE from './three.module.js';
import {OrbitControls} from './other/OrbitControls.js';
import {GLTFLoader} from './other/GLTFLoader.js';
// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.144/build/three.module.js';
// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.144/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.144/examples/jsm/loaders/GLTFLoader.js';


const nomsEquipe = [ 'samourai', 'viking', 'inka', 'grec' ];
let equipeChoisi = undefined;

const equipeLogo = {
    'samourai': './medias/samourai.svg',
    'viking': './medias/vikinsa.svg',
    'inka': './medias/inkas.svg',
    'grec': './medias/greks.svg',
}

const getCookie = (name) => {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookie = cookieArr[i].trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

const setEquipeCookie = async (equipe) => {
    let date = new Date();
    if (equipe !== null && nomsEquipe.includes(equipe)) {
        date.setTime(date.getTime() + (60 * 24 * 60 * 60 * 1000));
    } else {
        date.setTime(date.getTime() - 20);
    }
    let expires = "expires=" + date.toUTCString();
    document.cookie = 'equipe' + "=" + equipe + ";" + expires + ";path=/";
    getEquipeCookie()
}

const getEquipeCookie = async () => {
    let cookie = getCookie('equipe');
    let nomEquipe = ''
    let equipeClass = '';
    if (cookie !== null) {
        nomEquipe = cookie.split(';')[0];
    }
    const equipeClasses = [ ...nomsEquipe, 'ss-equipe' ];
    if (nomsEquipe.includes(nomEquipe)) {
        equipeChoisi = nomEquipe;
        equipeClass = equipeChoisi;
        const logoEl = document.getElementById('team-logo')
        logoEl.src = equipeLogo[equipeChoisi];
        if (equipeChoisi === 'viking') {
            logoEl.classList.add('vikinsize')
        } else {
            logoEl.classList.remove('vikinsize')
        }
    } else {
        equipeChoisi = undefined;
        equipeClass = 'ss-equipe';
    }
    const classesToRemove = equipeClasses.filter(value => value !== equipeClass)
    document.documentElement.classList.remove(...classesToRemove);
    document.documentElement.classList.add(equipeClass);
}

getEquipeCookie();


const starsUrl = new URL('../medias/stars.jpg', import.meta.url);

const DrakkarUrl = new URL('../medias/drakkar.glb', import.meta.url);
const GreksUrl = new URL('../medias/ile_greks_2.glb', import.meta.url);
const InkasUrl = new URL('../medias/ile_inkas.glb', import.meta.url);
const SamUrl = new URL('../medias/samourais.glb', import.meta.url);
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

const sceneContainer = document.getElementById('scene-container');

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
orbit.minDistance = 4;              // Zoom
orbit.maxPolarAngle = 3*Math.PI/4;  
orbit.minPolarAngle = Math.PI/4;    // Hauteur Max et Min
camera.position.set(4.5, 2.5, 4.5);
orbit.update();                     // Toujours update apres

const resizeCanva = () => {
    const containerWidth = sceneContainer.clientWidth;
    const containerHeight = sceneContainer.clientHeight;

    // Update camera aspect ratio
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(containerWidth, containerHeight);
};

window.addEventListener('resize', () => resizeCanva());

// Aides

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// const gridHelper = new THREE.GridHelper(30, 30);
// scene.add(gridHelper);


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


// Fond de la scene

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    starsUrl,
    starsUrl,
    starsUrl,
    starsUrl,
    starsUrl,
    starsUrl
]);


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
planet.add(atmosphere);


// Creation de la lune

const luneGeo = new THREE.OctahedronGeometry(3/4, 1);

const luneMat = new THREE.MeshStandardMaterial({
    color: 0xe42418, // rouge insa
    metalness: 0.5,
    roughness: 1,
    side: THREE.FrontSide
});
const lune = new THREE.Mesh(luneGeo, luneMat);

const lWireGeo = new THREE.OctahedronGeometry(3/4 + 0.005, 1); // Geometrie des aretes, attention aux clip
const lWireMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.15
}); // Leur texture
const lWire = new THREE.Mesh(lWireGeo, lWireMat);   // Creation
lune.add(lWire);

const lLight = new THREE.PointLight( 0xe42418, 1, 0, 1/2);
    
lune.add(lLight);

const luneOrbit = new THREE.Object3D();

scene.add(luneOrbit);
luneOrbit.add(lune);
lune.position.x += 6;
lune.userData.modelName = "luninsa";


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

const modeles = [
    {
        nom: 'drakkar',
        url: DrakkarUrl,
        scale: 0.1,
        vector: new THREE.Vector3(Math.cos(Math.PI/4.5)*2.85, Math.sin(Math.PI/4.5)*2.85, 0), // Placement sur la sphere, angle * rayon
        lightVector: new THREE.Vector3(Math.cos(Math.PI/4.5)*3.2, Math.sin(Math.PI/4.5)*3.2, 0),
        ajusteDeMerde: null,
        lightObj: null
    },
    {
        nom: 'ileGrk',
        url: GreksUrl,
        scale: 0.5,
        vector: new THREE.Vector3(Math.cos(Math.PI*6.6/8)*3.6, Math.sin(Math.PI*6.6/8)*3.6, 0),
        lightVector: new THREE.Vector3(Math.cos(Math.PI*6.8/8)*3.2, Math.sin(Math.PI*6.8/8)*3.2, 0),
        ajusteDeMerde: { posX: -1.4, posY: -1.3, posZ: -1.8, rotZ: 0.06, },
        lightObj: null
    },
    {
        nom: 'ileInka',
        url: InkasUrl,
        scale: 0.02,
        vector: new THREE.Vector3(0, Math.cos(Math.PI*2.3/4)*2.85, Math.sin(Math.PI*2.3/4)*2.85),
        lightVector: new THREE.Vector3(0, Math.cos(Math.PI*2.3/4)*3.2, Math.sin(Math.PI*2.3/4)*3.2),
        ajusteDeMerde: null,
        lightObj: null
    },
    {
        nom: 'samourai',
        url: SamUrl,
        scale: 0.02,
        vector: new THREE.Vector3(0, Math.cos(-2*Math.PI/5)*2.8, Math.sin(-2*Math.PI/5)*2.8),
        lightVector: new THREE.Vector3(0, Math.cos(-2*Math.PI/5)*3.2, Math.sin(-2*Math.PI/5)*3.2),
        ajusteDeMerde: null,
        lightObj: null
    },
]

const AddModel = (modelObj) => {
    gltfLoader.load(modelObj.url.href, (gltf) => {
        gltf.scene.position.set(0, 0, 0);
        const scene = gltf.scene;
        scene.scale.set(modelObj.scale, modelObj.scale, modelObj.scale);
        scene.userData.modelName = modelObj.nom;
        setupOrbit(modelObj.vector, scene);
        // console.log(scene.position);
        
        const light = new THREE.PointLight( 0xfff, 1/2, 0, 1/2);
        light.position.copy(modelObj.lightVector);
        modelObj.lightObj = light;

        // Ajustements de merde parce que le modele n'est pas au centre de la scene -> changer de modele
        if (modelObj.ajusteDeMerde) {
            scene.position.x += modelObj.ajusteDeMerde.posX;
            scene.position.y += modelObj.ajusteDeMerde.posY;
            scene.position.z += modelObj.ajusteDeMerde.posZ;
            scene.rotation.z += modelObj.ajusteDeMerde.rotZ;
        }

        const scenePivot = new THREE.Object3D();
        scenePivot.add(scene);
        scenePivot.add(light);
        planet.add(scenePivot);

    }, undefined, function(error) {
        console.error(error);
    });
}

modeles.forEach(obj => AddModel(obj));


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


// Clickable items

const mousePosition = new THREE.Vector2();
const rayCaster = new THREE.Raycaster();

let lastHovered = null;

window.addEventListener('mousemove', function(e) {
    const rect = sceneContainer.getBoundingClientRect();
    mousePosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mousePosition.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children, true);

    // console.log('Intersects:', intersects); // Log the intersections

    let isClickable = false;

    for (let i = 0; i < intersects.length; i++) {
        let obj = intersects[i].object;
        while (obj) {
            if (obj.userData && [ 'drakkar', 'ileGrk', 'ileInka', 'samourai', 'luninsa' ].includes(obj.userData.modelName)) {
                // console.log('Found clickable object:', obj.userData.modelName); // Log when a clickable object is found
                isClickable = true;
                const temp = modeles.find((theObj) => theObj.nom === obj.userData.modelName);
                if (temp) {
                    lastHovered = temp.lightObj;
                    lastHovered.color.set(0xffec00);
                    lastHovered.intensity = 1;
                    console.log(lastHovered);
                    console.log(lastHovered.color);
                }

                break; // Found the clickable model, no need to check parents further
            }
            obj = obj.parent; // Move up to the parent
        };
    };
    sceneContainer.style.cursor = isClickable ? 'pointer' : 'default';
    if (!isClickable && lastHovered) {
        lastHovered.color.set(0xfff);
        lastHovered.intensity = 0.5;
        console.log(lastHovered.color);

        lastHovered = null;

    };
});

// Teams

window.addEventListener('click', function() {
    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children, true);
    const changeEquipeObj = { // valeur du cookie "equipe" en fonction du nom de l'objet
        'drakkar': 'viking',
        'ileGrk': 'grec',
        'ileInka': 'inka',
        'samourai': 'samourai',
    }

    for (let i = 0; i < intersects.length; i++) {
        let obj = intersects[i].object;
        while (obj) {
            if (obj.userData) {
                if (obj.userData.modelName in changeEquipeObj) {
                    setEquipeCookie(changeEquipeObj[obj.userData.modelName]);
                    resizeCanva();
                    break; // Found the clickable model, no need to check parents further
                }
                if (obj.userData.modelName === 'luninsa') {
                    window.open('https://www.insa-toulouse.fr/', '_blank');
                    break;
                }
            }
            obj = obj.parent; // Move up to the parent
        };
    };
});


// Links
const infos = [ "planning", "blouse", "guide-ppa", "prevention" ]
/* let planning = document.getElementById("planning");
let blouse = document.getElementById("blouse");
let guidePpa = document.getElementById("guide-ppa");
let prevention = document.getElementById("prevention");
*/

let parrainage = document.getElementById("parrainage");

const showInfo = (info) => {
    if ([ ...infos, 'main' ].includes(info)) {
        renderer.setAnimationLoop(null);
        document.documentElement.classList.remove(...[ ...infos, 'main' ]);
        document.documentElement.classList.add(info, 'info' );

        // -------- Animation

        document.documentElement.classList.remove( 'main-transition' );
        document.querySelectorAll('#info-top').forEach(el => el.classList.add( 'transition' ));


        document.querySelectorAll('#down-arrow').forEach(el => el.classList.remove('animate-down-arrow'));
        const downArrowEl = document.querySelector(`#info-${info} #down-arrow`);
        if (downArrowEl) {
            downArrowEl.classList.add('animate-down-arrow');
        }
        document.querySelector(`#info-${info}`).scrollTo(0, 0);
    }
}

const showMain = () => {
    document.documentElement.classList.remove(...[ ...infos, 'info' ]);
    document.documentElement.classList.add('main');

    // -------- Animation

    document.querySelectorAll('#info-top').forEach(el => el.classList.remove( 'transition' ));
    document.documentElement.classList.add( 'main-transition' );


    renderer.setAnimationLoop(animate);
}

infos.forEach(id => { 
    document.getElementById(id).addEventListener('click', () => showInfo(id) );
});

parrainage.addEventListener('click', () => {
    window.open('https://parrainage.accueil.insat.fr', '_blank');
});


const mainButton = (element) => {
    element.addEventListener('click', () => showMain());
    element.addEventListener('mouseover', () => {
    element.style.cursor = 'pointer';
    });
} ;

mainButton(document.getElementById("back-arrow"));
mainButton(document.getElementById("back-arrow-2"));
mainButton(document.getElementById("back-arrow-3"));
mainButton(document.getElementById("back-arrow-4"));

let toggleFS = -1;

document.getElementById('full-screen').addEventListener('click', () => {
    toggleFS = -toggleFS;
    if ( toggleFS === 1 ) {
    document.documentElement.classList.add('fs');
    } else { if ( toggleFS === -1 ) {
    document.documentElement.classList.remove('fs');
    }};
    resizeCanva();
});

let map = document.getElementById("map");

map.addEventListener('mouseover', () => {
    map.style.cursor = 'pointer';    
});

sceneContainer.addEventListener('resize', () => resizeCanva());

window.addEventListener('load', () => resizeCanva(), { once: true });


const hidePopup = () => [ 'popup', 'backdrop' ].forEach(id => document.getElementById(id).classList.add('no-show'));

const showPopup = (text, tout=0) => {
            // tout est en secondes, il s'affiche est disparait au bout de x secondes
            // si tout = 0, reste en permanence 
    document.getElementById('popup').innerHTML = text;
    [ 'popup', 'backdrop' ].forEach(id => document.getElementById(id).classList.remove('no-show'));
    if (tout !== 0) {
        setTimeout(hidePopup, tout * 1000);
    }
}

let bureauHeader = document.getElementById('bureau-header');

window.addEventListener('load', () => {
    document.getElementById('backdrop').addEventListener('click', hidePopup);
    showPopup("<span class='chokokutai-regular'>ATTENTION, VEUILLEZ LIRE ATTENTIVEMENT !</span><br><br>Bonjour ! Ceci est une bulle d'aide ! Vous pouvez l'ouvrir en cliquant sur <b> l'en-tête du bureau </b>.<br><br>- Il est VIVEMENT recommandé de naviguer sur ce site avec un ordinateur. Merci également d'utiliser Chrome ou Firefox. En cas de problème quelconque, rechargez la page. Si le problème persiste, passez sur ordinateur.<br>- Pour commencer, choisissez une équipe ! Pour ce faire il suffit de chercher la vôtre sur la planète, puis de cliquer dessus.<br>- Cliquez sur <img src='./medias/map.svg' style='height:1rem;'/> pour ouvrir une carte de l'INSA faite par le club info.<br><br>Cliquez en dehors de la bulle d'aide pour en sortir. Bonne navigation !");
    bureauHeader.addEventListener('click', () => showPopup("Bonjour ! Ceci est une bulle d'aide ! Vous pouvez l'ouvrir en cliquant sur <b> l'en-tête du bureau </b>.<br><br>- Il est VIVEMENT recommandé de naviguer sur ce site avec un ordinateur. Merci également d'utiliser Chrome ou Firefox. En cas de problème quelconque, rechargez la page. Si le problème persiste, passez sur ordinateur.<br>- Pour commencer, choisissez une équipe ! Pour ce faire il suffit de chercher la votre sur la planète, puis de cliquer dessus.<br>- Cliquez sur <img src='./medias/map.svg' style='height:1rem;'/> pour ouvrir une carte de l'INSA faite par le club info.<br><br>Bonne navigation !"));
});

bureauHeader.addEventListener('mouseover', () => {bureauHeader.style.cursor = 'pointer'});

const creditText = "Conception du site : Hook Alban (contact : albanhook@gmail.com)<br>Design graphique : Evan De Oliveira (instagram : evan.dlvr)<br>& Audrey Tribet (instagram : audreyy.tribett)<br>Hébergement : Club Info<br>En collaboration avec le bureau de la semaine d'accueil" // <img style='max-height: 7dvh;' src='./medias/logo-bureau.svg'>

let creditMain = document.getElementById('credit-main');
let creditInfo = document.getElementById('credit-info');
let creditInfo2 = document.getElementById('credit-info-2');
let creditInfo3 = document.getElementById('credit-info-3');
let creditInfo4 = document.getElementById('credit-info-4');

const creditFc = (idEl) => {
    idEl.addEventListener('click', () => {showPopup(creditText)});
    idEl.addEventListener('mouseover', () => {idEl.style.cursor = 'pointer'});
};

creditFc(creditMain);
creditFc(creditInfo);
creditFc(creditInfo2);
creditFc(creditInfo3);
creditFc(creditInfo4);


// Animation
const animate = (time) => {
    time *= 0.001;
    planet.rotation.y += 0.001; // Rotation du groupe planete sur son axe
    starObj.rotation.y += 0.00015;  // Revolution de l'etoile autour de la planete
    star.rotation.y += 0.0005;  // Rotation de l'etoile sur son axe
    cloudsGroup.rotation.y += 0.00025; // Moins vite que la planete
    luneOrbit.rotation.y += 0.0015;
    luneOrbit.rotation.z += 0.0005;

    renderer.render(scene, camera);
    orbit.update();
};

renderer.setAnimationLoop(animate);
