import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Respect the OS-level "reduce motion" setting throughout.
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- 0. BOOT SEQUENCE ---
// The CSS animation already dismisses the overlay, so a JS failure can't trap
// the visitor. This just animates the lines and removes the node afterwards.
const bootScreen = document.getElementById('boot-screen');
if (bootScreen && !REDUCED_MOTION) {
    document.querySelectorAll('.boot-line').forEach((line) => {
        const delay = parseInt(line.dataset.delay, 10) || 0;
        setTimeout(() => line.classList.add('visible'), delay);
    });

    setTimeout(() => {
        bootScreen.classList.add('fade-out');
        setTimeout(() => bootScreen.remove(), 600);
    }, 2000);
} else if (bootScreen) {
    bootScreen.remove();
}

// --- 1. GSAP SCROLL ANIMATIONS ---
window.addEventListener('load', () => {
    if (REDUCED_MOTION) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.fromTo(card,
            { y: 50, opacity: 0 },
            { scrollTrigger: { trigger: card, start: 'top 90%' }, y: 0, opacity: 1, duration: 0.6, delay: (i % 3) * 0.1 }
        );
    });

    gsap.utils.toArray('.log-entry').forEach((log) => {
        gsap.fromTo(log,
            { x: -30, opacity: 0 },
            { scrollTrigger: { trigger: log, start: 'top 90%' }, x: 0, opacity: 1, duration: 0.5 }
        );
    });

    gsap.fromTo('.vision-container',
        { scale: 0.95, opacity: 0 },
        { scrollTrigger: { trigger: '#vision', start: 'top 80%' }, scale: 1, opacity: 1, duration: 0.8 }
    );
});

// --- 2. ROBOTIC CURSOR ---
// The outline element is display:none in CSS, so the old .animate() call on it
// was pure waste on every mousemove. Removed.
const cursorDot = document.querySelector('[data-cursor-dot]');
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (cursorDot && hasFinePointer) {
    window.addEventListener('mousemove', (e) => {
        cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }, { passive: true });

    document.querySelectorAll('a, button, .project-card').forEach((el) => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
} else if (cursorDot) {
    cursorDot.remove();
}

// --- 3. FLOATING PARTICLES ---
const particlesContainer = document.getElementById('particles-container');
if (particlesContainer && !REDUCED_MOTION && window.innerWidth > 900) {
    const frag = document.createDocumentFragment();

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';

        const size = Math.random() * 2 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.1;

        frag.appendChild(particle);
    }
    particlesContainer.appendChild(frag);
}

// --- 3b. LIGHTBOX ---
// The fa-expand icon promised this and nothing implemented it.
const lightbox = document.getElementById('lightbox');
if (lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    let lastFocused = null;

    const openLightbox = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    };

    const closeLightbox = () => {
        lightbox.hidden = true;
        lightboxImg.src = '';
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    };

    document.querySelectorAll('.project-thumbnail').forEach((btn) => {
        btn.addEventListener('click', () => {
            const img = btn.querySelector('img');
            if (!img) return;
            lastFocused = btn;
            openLightbox(img.currentSrc || img.src, img.alt);
        });
    });

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
}

// --- 4. THE "DIGITAL WATERFALL" BACKGROUND ---
const bgContainer = document.getElementById('bg-canvas-container');

if (bgContainer && !REDUCED_MOTION) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.03);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

    // Cache the flat base coordinates once instead of reading them back per frame.
    const positionAttribute = planeGeometry.attributes.position;
    const baseX = new Float32Array(positionAttribute.count);
    const baseY = new Float32Array(positionAttribute.count);
    for (let i = 0; i < positionAttribute.count; i++) {
        baseX[i] = positionAttribute.getX(i);
        baseY[i] = positionAttribute.getY(i);
    }

    let mouseX = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) - 0.5;
    }, { passive: true });

    const clock = new THREE.Clock();
    let running = true;
    let rafId = null;

    // Wave math is throttled to ~30fps; the render itself stays at display rate.
    let lastWaveUpdate = 0;

    function animateBg() {
        rafId = requestAnimationFrame(animateBg);
        const time = clock.getElapsedTime();

        if (time - lastWaveUpdate > 0.033) {
            lastWaveUpdate = time;
            for (let i = 0; i < positionAttribute.count; i++) {
                positionAttribute.setZ(
                    i,
                    Math.sin(baseX[i] * 0.2 + time * 0.5) * 1.5 +
                    Math.sin(baseY[i] * 0.2 + time * 0.8) * 1.5
                );
            }
            positionAttribute.needsUpdate = true;
        }

        const scrollPercent = window.scrollY * 0.002;
        camera.position.y = 1 + scrollPercent * 3;
        camera.rotation.x = -scrollPercent * 0.2;
        terrain.rotation.z = mouseX * 0.05;

        renderer.render(scene, camera);
    }
    animateBg();

    // Stop burning GPU/battery when the tab isn't visible.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && running) {
            cancelAnimationFrame(rafId);
            running = false;
        } else if (!document.hidden && !running) {
            running = true;
            animateBg();
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- 5. HUMANOID WIREFRAME ---
const container = document.getElementById('canvas-container');

if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 4;
    camera.position.y = 0.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const humanoid = new THREE.Group();

    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffcc, wireframe: true, transparent: true, opacity: 0.6
    });
    const pointMaterial = new THREE.PointsMaterial({
        color: 0x00ffcc, size: 0.03, transparent: true, opacity: 0.9
    });
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x7000ff, wireframe: true, transparent: true, opacity: 0.3
    });

    // Head
    const headGeo = new THREE.IcosahedronGeometry(0.25, 1);
    const head = new THREE.Mesh(headGeo, wireMaterial);
    const headPoints = new THREE.Points(headGeo, pointMaterial);
    head.position.y = 1.7;
    headPoints.position.y = 1.7;
    humanoid.add(head, headPoints);

    // Visor
    const visorGeo = new THREE.BoxGeometry(0.3, 0.05, 0.1);
    const visor = new THREE.Mesh(visorGeo, new THREE.MeshBasicMaterial({
        color: 0x00ffcc, transparent: true, opacity: 0.8
    }));
    visor.position.set(0, 1.72, 0.15);
    humanoid.add(visor);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8), wireMaterial);
    neck.position.y = 1.4;
    humanoid.add(neck);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.35, 2, 3, 2);
    const torso = new THREE.Mesh(torsoGeo, wireMaterial);
    const torsoPoints = new THREE.Points(torsoGeo, pointMaterial);
    torso.position.y = 0.85;
    torsoPoints.position.y = 0.85;
    humanoid.add(torso, torsoPoints);

    // Chest core
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({
        color: 0x00ffcc, transparent: true, opacity: 0.9
    }));
    core.position.set(0, 1.0, 0.15);
    humanoid.add(core);

    // Pelvis
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.3, 2, 1, 1), wireMaterial);
    pelvis.position.y = 0.3;
    humanoid.add(pelvis);

    function createArm(isLeft) {
        const arm = new THREE.Group();
        const side = isLeft ? 1 : -1;

        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), wireMaterial);
        shoulder.position.set(side * 0.45, 1.2, 0);
        arm.add(shoulder);

        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 8), wireMaterial);
        upperArm.position.set(side * 0.5, 0.95, 0);
        upperArm.rotation.z = side * 0.15;
        arm.add(upperArm);

        const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), wireMaterial);
        elbow.position.set(side * 0.55, 0.7, 0);
        arm.add(elbow);

        const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.35, 8), wireMaterial);
        lowerArm.position.set(side * 0.55, 0.45, 0);
        arm.add(lowerArm);

        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.04, 1, 2, 1), wireMaterial);
        hand.position.set(side * 0.55, 0.22, 0);
        arm.add(hand);

        return arm;
    }

    humanoid.add(createArm(true), createArm(false));

    function createLeg(isLeft) {
        const leg = new THREE.Group();
        const side = isLeft ? 1 : -1;

        const hip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), wireMaterial);
        hip.position.set(side * 0.18, 0.15, 0);
        leg.add(hip);

        const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.5, 8), wireMaterial);
        upperLeg.position.set(side * 0.18, -0.15, 0);
        leg.add(upperLeg);

        const knee = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), wireMaterial);
        knee.position.set(side * 0.18, -0.45, 0);
        leg.add(knee);

        const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 8), wireMaterial);
        lowerLeg.position.set(side * 0.18, -0.75, 0);
        leg.add(lowerLeg);

        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.2, 1, 1, 2), wireMaterial);
        foot.position.set(side * 0.18, -1.0, 0.05);
        leg.add(foot);

        return leg;
    }

    humanoid.add(createLeg(true), createLeg(false));

    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 1), glowMaterial);
    shell.position.y = 0.5;
    humanoid.add(shell);

    humanoid.position.y = -0.3;
    scene.add(humanoid);

    // OrbitControls owns rotation. The old code also applied its own mousemove
    // rotation to the same object, so the two fought each other. Auto-rotate
    // now just slows down while the pointer is over the model.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = !REDUCED_MOTION;
    controls.autoRotateSpeed = 0.5;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 1.5;

    container.addEventListener('mouseenter', () => { controls.autoRotateSpeed = 0.15; });
    container.addEventListener('mouseleave', () => { controls.autoRotateSpeed = 0.5; });

    const clock = new THREE.Clock();
    let rafId = null;
    let inView = true;
    let running = false;

    function animate() {
        rafId = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        if (!REDUCED_MOTION) {
            humanoid.scale.y = 1 + Math.sin(time * 2) * 0.02;
            core.scale.setScalar(1 + Math.sin(time * 3) * 0.2);
            core.rotation.y = time * 2;
            visor.material.opacity = 0.6 + Math.sin(time * 10) * 0.2;
            shell.rotation.y = time * 0.2;
            shell.rotation.x = Math.sin(time * 0.5) * 0.1;
        }

        controls.update();
        renderer.render(scene, camera);
    }

    function start() {
        if (running) return;
        running = true;
        animate();
    }
    function stop() {
        if (!running) return;
        running = false;
        cancelAnimationFrame(rafId);
    }

    // Only render while the hero is actually on screen and the tab is visible.
    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            inView = entries[0].isIntersecting;
            if (inView && !document.hidden) start(); else stop();
        }, { threshold: 0.01 }).observe(container);
    } else {
        start();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (inView) start();
    });

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}if(cursorDot && cursorOutline) {
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
