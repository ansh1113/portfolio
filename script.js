import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 1. GSAP ANIMATIONS ---
setTimeout(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Research Cards (Slot in from right)
        gsap.utils.toArray('.research-card').forEach((card, i) => {
            gsap.fromTo(card, 
                { x: 50, opacity: 0 },
                { scrollTrigger: { trigger: card, start: "top 85%" }, x: 0, opacity: 1, duration: 0.6, delay: i * 0.1 }
            );
        });

        // Project Cards (Slot in from bottom)
        gsap.utils.toArray('.project-card').forEach((card, i) => {
            gsap.fromTo(card, 
                { y: 50, opacity: 0 },
                { scrollTrigger: { trigger: card, start: "top 90%" }, y: 0, opacity: 1, duration: 0.6, delay: i * 0.1 }
            );
        });

        // Logs (Fade in)
        gsap.utils.toArray('.log-entry').forEach((log, i) => {
            gsap.fromTo(log,
                { x: -30, opacity: 0 },
                { scrollTrigger: { trigger: log, start: "top 90%" }, x: 0, opacity: 1, duration: 0.5 }
            );
        });
        
        // Vision (Zoom in)
        gsap.fromTo('.vision-container', 
            { scale: 0.95, opacity: 0 },
            { scrollTrigger: { trigger: '#vision', start: "top 80%" }, scale: 1, opacity: 1, duration: 0.8 }
        );
    }
}, 100);

// --- 2. ROBOTIC CURSOR ---
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

if(cursorDot && cursorOutline) {
    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 400, fill: "forwards" });
    });

    // Add hover state
    const clickables = document.querySelectorAll('a, button, .research-card, .project-card');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// --- 3. THE "DIGITAL TERRAIN" BACKGROUND (NEW & IMPROVED) ---
const bgContainer = document.getElementById('bg-canvas-container');

if (bgContainer) {
    const scene = new THREE.Scene();
    // Add Fog for depth (The "Endless" look)
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.04); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    // Position camera low to the ground for that "Drone" feel
    camera.position.set(0, 1, 5); 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    bgContainer.appendChild(renderer.domElement);

    // --- A. The Wireframe Terrain ---
    // Create a large plane
    const planeGeometry = new THREE.PlaneGeometry(80, 80, 60, 60);
    
    // Deform the plane (Make it hilly)
    const positionAttribute = planeGeometry.attributes.position;
    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        // Create rolling hills using sine waves
        const z = Math.sin(x * 0.3) * 1.5 + Math.sin(y * 0.2) * 1.5; 
        positionAttribute.setZ(i, z);
    }
    // Re-compute normals for lighting (optional, but good practice)
    planeGeometry.computeVertexNormals();

    const planeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffcc, // Cyan Neon
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const terrain = new THREE.Mesh(planeGeometry, planeMaterial);
    terrain.rotation.x = -Math.PI / 2; // Lay flat
    scene.add(terrain);

    // --- B. Floating "Data Particles" ---
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 400;
    const pPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount * 3; i+=3) {
        pPos[i] = (Math.random() - 0.5) * 60; // Wide X
        pPos[i+1] = Math.random() * 10;       // Height Y
        pPos[i+2] = (Math.random() - 0.5) * 60; // Depth Z
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0x7000ff, size: 0.1 });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // --- C. Animation Loop ---
    let mouseY = 0;
    let mouseX = 0;

    // Track mouse for camera tilt
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) - 0.5;
        mouseY = (event.clientY / window.innerHeight) - 0.5;
    });

    function animateBg() {
        requestAnimationFrame(animateBg);

        const time = Date.now() * 0.0005;

        // 1. Move Terrain (Flyover Effect)
        // We move the terrain backwards, and when it goes too far, we reset it
        // This creates an infinite loop illusion
        terrain.position.z = (time * 4) % 2; 

        // 2. Interactive Camera Tilt (Drone Pilot feel)
        // Smoothly interpolate camera rotation based on mouse
        camera.rotation.x += ((-mouseY * 0.5) - camera.rotation.x) * 0.05;
        camera.rotation.y += ((-mouseX * 0.5) - camera.rotation.y) * 0.05;
        
        // 3. Scroll Speed Boost
        // Move camera slightly up/down based on scroll to see more of the map
        camera.position.y = 1 + (window.scrollY * 0.001);

        renderer.render(scene, camera);
    }
    animateBg();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- 4. FOREGROUND GLOBE (Header) ---
const container = document.getElementById('canvas-container');

if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.2, 4);
    const material = new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.015, transparent: true, opacity: 0.8 });
    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);

    const wireGeo = new THREE.IcosahedronGeometry(1.21, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x7000ff, wireframe: true, transparent: true, opacity: 0.3 });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enableZoom = false; controls.autoRotate = true; controls.autoRotateSpeed = 2.0;

    function animate() {
        requestAnimationFrame(animate);
        sphere.rotation.y += 0.002;
        wireframe.rotation.x -= 0.002;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        if(container) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
}
