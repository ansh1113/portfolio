import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 0. BOOT SEQUENCE ---
const bootScreen = document.getElementById('boot-screen');
if (bootScreen) {
    const bootLines = document.querySelectorAll('.boot-line');
    const progressBar = document.querySelector('.boot-progress-bar');
    
    // Animate each line appearing
    bootLines.forEach((line, index) => {
        const delay = parseInt(line.dataset.delay) || 0;
        setTimeout(() => {
            line.classList.add('visible');
        }, delay);
    });
    
    // Progress bar animation
    if (progressBar) {
        progressBar.style.animation = 'bootProgress 1.8s ease-out forwards';
    }
    
    // Hide boot screen after animation
    setTimeout(() => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 500);
    }, 2000);
}

// --- 1. GSAP SCROLL ANIMATIONS ---
setTimeout(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Project Cards (Slot in from bottom)
        gsap.utils.toArray('.project-card').forEach((card, i) => {
            gsap.fromTo(card, 
                { y: 50, opacity: 0 },
                { scrollTrigger: { trigger: card, start: "top 90%" }, y: 0, opacity: 1, duration: 0.6, delay: (i % 3) * 0.1 }
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

    const clickables = document.querySelectorAll('a, button, .project-card');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// --- 3. FLOATING PARTICLES ---
const particlesContainer = document.getElementById('particles-container');
if (particlesContainer) {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        
        // Random size (1-3px)
        const size = Math.random() * 2 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random animation duration and delay
        particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        
        particlesContainer.appendChild(particle);
    }
}

// --- 4. THE "DIGITAL WATERFALL" BACKGROUND ---
const bgContainer = document.getElementById('bg-canvas-container');

if (bgContainer) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.03); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5); 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    bgContainer.appendChild(renderer.domElement);

    const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50); 
    const planeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffcc,
        wireframe: true,
        transparent: true,
        opacity: 0.15 
    });

    const terrain = new THREE.Mesh(planeGeometry, planeMaterial);
    terrain.rotation.x = -Math.PI / 2; 
    terrain.position.y = -3; 
    terrain.position.z = -10;
    scene.add(terrain);

    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) - 0.5;
        mouseY = (event.clientY / window.innerHeight) - 0.5;
    });

    const clock = new THREE.Clock();

    function animateBg() {
        requestAnimationFrame(animateBg);
        const time = clock.getElapsedTime();

        const positionAttribute = planeGeometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const zHeight = Math.sin(x * 0.2 + time * 0.5) * 1.5 + Math.sin(y * 0.2 + time * 0.8) * 1.5;
            positionAttribute.setZ(i, zHeight);
        }
        positionAttribute.needsUpdate = true;

        const scrollPercent = window.scrollY * 0.002;
        camera.position.y = 1 + scrollPercent * 3; 
        camera.rotation.x = -scrollPercent * 0.2; 
        terrain.rotation.z = mouseX * 0.05;

        renderer.render(scene, camera);
    }
    animateBg();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- 5. HUMANOID WIREFRAME (Replaces Globe) ---
const container = document.getElementById('canvas-container');

if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 4;
    camera.position.y = 0.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create humanoid figure using basic geometries
    const humanoid = new THREE.Group();
    
    // Materials
    const wireMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffcc, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.6 
    });
    const pointMaterial = new THREE.PointsMaterial({ 
        color: 0x00ffcc, 
        size: 0.03, 
        transparent: true, 
        opacity: 0.9 
    });
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x7000ff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.3 
    });

    // Head (icosahedron for robotic look)
    const headGeo = new THREE.IcosahedronGeometry(0.25, 1);
    const head = new THREE.Mesh(headGeo, wireMaterial);
    const headPoints = new THREE.Points(headGeo, pointMaterial);
    head.position.y = 1.7;
    headPoints.position.y = 1.7;
    humanoid.add(head);
    humanoid.add(headPoints);
    
    // Visor/Eyes (glowing bar)
    const visorGeo = new THREE.BoxGeometry(0.3, 0.05, 0.1);
    const visor = new THREE.Mesh(visorGeo, new THREE.MeshBasicMaterial({ 
        color: 0x00ffcc, 
        transparent: true, 
        opacity: 0.8 
    }));
    visor.position.set(0, 1.72, 0.15);
    humanoid.add(visor);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8);
    const neck = new THREE.Mesh(neckGeo, wireMaterial);
    neck.position.y = 1.4;
    humanoid.add(neck);

    // Torso (tapered box)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.35, 2, 3, 2);
    const torso = new THREE.Mesh(torsoGeo, wireMaterial);
    const torsoPoints = new THREE.Points(torsoGeo, pointMaterial);
    torso.position.y = 0.85;
    torsoPoints.position.y = 0.85;
    humanoid.add(torso);
    humanoid.add(torsoPoints);
    
    // Chest core (glowing center)
    const coreGeo = new THREE.OctahedronGeometry(0.12, 0);
    const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ 
        color: 0x00ffcc, 
        transparent: true, 
        opacity: 0.9 
    }));
    core.position.set(0, 1.0, 0.15);
    humanoid.add(core);

    // Pelvis
    const pelvisGeo = new THREE.BoxGeometry(0.5, 0.25, 0.3, 2, 1, 1);
    const pelvis = new THREE.Mesh(pelvisGeo, wireMaterial);
    pelvis.position.y = 0.3;
    humanoid.add(pelvis);

    // Arms
    function createArm(isLeft) {
        const arm = new THREE.Group();
        const side = isLeft ? 1 : -1;
        
        // Shoulder joint
        const shoulderGeo = new THREE.SphereGeometry(0.1, 8, 6);
        const shoulder = new THREE.Mesh(shoulderGeo, wireMaterial);
        shoulder.position.set(side * 0.45, 1.2, 0);
        arm.add(shoulder);
        
        // Upper arm
        const upperArmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.4, 8);
        const upperArm = new THREE.Mesh(upperArmGeo, wireMaterial);
        upperArm.position.set(side * 0.5, 0.95, 0);
        upperArm.rotation.z = side * 0.15;
        arm.add(upperArm);
        
        // Elbow
        const elbowGeo = new THREE.SphereGeometry(0.06, 6, 4);
        const elbow = new THREE.Mesh(elbowGeo, wireMaterial);
        elbow.position.set(side * 0.55, 0.7, 0);
        arm.add(elbow);
        
        // Lower arm
        const lowerArmGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.35, 8);
        const lowerArm = new THREE.Mesh(lowerArmGeo, wireMaterial);
        lowerArm.position.set(side * 0.55, 0.45, 0);
        arm.add(lowerArm);
        
        // Hand
        const handGeo = new THREE.BoxGeometry(0.08, 0.12, 0.04, 1, 2, 1);
        const hand = new THREE.Mesh(handGeo, wireMaterial);
        hand.position.set(side * 0.55, 0.22, 0);
        arm.add(hand);
        
        return arm;
    }
    
    humanoid.add(createArm(true));
    humanoid.add(createArm(false));

    // Legs
    function createLeg(isLeft) {
        const leg = new THREE.Group();
        const side = isLeft ? 1 : -1;
        
        // Hip joint
        const hipGeo = new THREE.SphereGeometry(0.08, 8, 6);
        const hip = new THREE.Mesh(hipGeo, wireMaterial);
        hip.position.set(side * 0.18, 0.15, 0);
        leg.add(hip);
        
        // Upper leg
        const upperLegGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.5, 8);
        const upperLeg = new THREE.Mesh(upperLegGeo, wireMaterial);
        upperLeg.position.set(side * 0.18, -0.15, 0);
        leg.add(upperLeg);
        
        // Knee
        const kneeGeo = new THREE.SphereGeometry(0.07, 6, 4);
        const knee = new THREE.Mesh(kneeGeo, wireMaterial);
        knee.position.set(side * 0.18, -0.45, 0);
        leg.add(knee);
        
        // Lower leg
        const lowerLegGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.45, 8);
        const lowerLeg = new THREE.Mesh(lowerLegGeo, wireMaterial);
        lowerLeg.position.set(side * 0.18, -0.75, 0);
        leg.add(lowerLeg);
        
        // Foot
        const footGeo = new THREE.BoxGeometry(0.1, 0.06, 0.2, 1, 1, 2);
        const foot = new THREE.Mesh(footGeo, wireMaterial);
        foot.position.set(side * 0.18, -1.0, 0.05);
        leg.add(foot);
        
        return leg;
    }
    
    humanoid.add(createLeg(true));
    humanoid.add(createLeg(false));

    // Add outer glow shell
    const shellGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const shell = new THREE.Mesh(shellGeo, glowMaterial);
    shell.position.y = 0.5;
    humanoid.add(shell);

    // Center the humanoid
    humanoid.position.y = -0.3;
    scene.add(humanoid);

    // Interactive mouse tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;
    
    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) - 0.5;
        const y = ((event.clientY - rect.top) / rect.height) - 0.5;
        
        targetRotationY = x * 0.5;
        targetRotationX = y * 0.3;
    });
    
    container.addEventListener('mouseleave', () => {
        targetRotationX = 0;
        targetRotationY = 0;
    });

    // Orbit controls for drag rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 1.5;

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Smooth rotation following mouse
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;
        
        // Subtle breathing animation
        const breathe = Math.sin(time * 2) * 0.02;
        humanoid.scale.y = 1 + breathe;
        
        // Core pulsing
        if (core) {
            core.scale.setScalar(1 + Math.sin(time * 3) * 0.2);
            core.rotation.y = time * 2;
        }
        
        // Visor flicker
        if (visor) {
            visor.material.opacity = 0.6 + Math.sin(time * 10) * 0.2;
        }
        
        // Shell rotation
        if (shell) {
            shell.rotation.y = time * 0.2;
            shell.rotation.x = Math.sin(time * 0.5) * 0.1;
        }

        // Apply mouse rotation
        humanoid.rotation.x = currentRotationX;
        humanoid.rotation.y += (currentRotationY - humanoid.rotation.y) * 0.1;

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
