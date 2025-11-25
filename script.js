import * as THREE from 'three'; 
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- GLASS EFFECT ENFORCEMENT (MUST BE FIRST) ---
const applyGlassEffect = () => {
    const terminal = document.querySelector('.terminal-window');
    if (terminal) {
        terminal.style.setProperty('background', 'rgba(19, 19, 31, 0.08)', 'important');
        terminal.style.setProperty('backdrop-filter', 'blur(16px)', 'important');
        terminal.style.setProperty('-webkit-backdrop-filter', 'blur(16px)', 'important');
    }

    const terminalHeader = document.querySelector('.terminal-header');
    if (terminalHeader) {
        terminalHeader.style.setProperty('background', 'rgba(26, 26, 37, 0.15)', 'important');
    }

    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
        terminalBody.style.setProperty('background', 'transparent', 'important');
    }

    const cards = document.querySelectorAll('.research-card, .project-card');
    cards.forEach(card => {
        card.style.setProperty('background', 'rgba(19, 19, 31, 0.08)', 'important');
        card.style.setProperty('backdrop-filter', 'blur(16px)', 'important');
        card.style.setProperty('-webkit-backdrop-filter', 'blur(16px)', 'important');
    });
};

// Apply immediately
applyGlassEffect();

// Apply on DOM ready
document.addEventListener('DOMContentLoaded', applyGlassEffect);

// Apply multiple times to catch any delayed scripts
setTimeout(applyGlassEffect, 100);
setTimeout(applyGlassEffect, 500);
setTimeout(applyGlassEffect, 1000);
setTimeout(applyGlassEffect, 2000);

// MutationObserver to watch for style changes
const observer = new MutationObserver(() => {
    applyGlassEffect();
});

document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.querySelector('.terminal-window');
    const terminalHeader = document.querySelector('.terminal-header');
    const terminalBody = document.querySelector('.terminal-body');
    
    if (terminal) {
        observer.observe(terminal, { attributes: true, attributeFilter: ['style'], childList: false, subtree: false });
    }
    if (terminalHeader) {
        observer.observe(terminalHeader, { attributes: true, attributeFilter: ['style'], childList: false, subtree: false });
    }
    if (terminalBody) {
        observer.observe(terminalBody, { attributes: true, attributeFilter: ['style'], childList: false, subtree: false });
    }
});

// --- 1. GSAP SCROLL ANIMATIONS ---
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
        
        // Vision (Zoom in) - Apply glass effect after animation
        gsap.fromTo('.vision-container', 
            { scale: 0.95, opacity: 0 },
            { 
                scrollTrigger: { 
                    trigger: '#vision', 
                    start: "top 80%",
                    onEnter: applyGlassEffect,
                    onEnterBack: applyGlassEffect
                }, 
                scale: 1, 
                opacity: 1, 
                duration: 0.8,
                onComplete: applyGlassEffect
            }
        );

        // Reapply glass effect when scrolling to vision section
        ScrollTrigger.create({
            trigger: '#vision',
            start: "top 80%",
            onEnter: applyGlassEffect,
            onEnterBack: applyGlassEffect
        });
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

    const clickables = document.querySelectorAll('a, button, .research-card, .project-card');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// --- 3. THE "DIGITAL WATERFALL" BACKGROUND (NEW) ---
const bgContainer = document.getElementById('bg-canvas-container');

if (bgContainer) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.03); 

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5); 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
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
    controls.enableDamping = true; 
    controls.enableZoom = false; 
    controls.autoRotate = true; 
    controls.autoRotateSpeed = 2.0;

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
