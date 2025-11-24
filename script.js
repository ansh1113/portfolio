import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 1. GSAP SCROLL ANIMATIONS ---
setTimeout(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Animate Research Cards
        gsap.utils.toArray('.research-card').forEach((card, i) => {
            gsap.fromTo(card, 
                { x: 100, opacity: 0 },
                { 
                    scrollTrigger: { trigger: card, start: "top 85%" },
                    x: 0, opacity: 1, duration: 0.8, delay: i * 0.1, ease: "back.out(1.7)" 
                }
            );
        });

        // Animate Project Cards
        gsap.utils.toArray('.project-card').forEach((card, i) => {
            gsap.fromTo(card, 
                { y: 50, opacity: 0 },
                { 
                    scrollTrigger: { trigger: card, start: "top 90%" },
                    y: 0, opacity: 1, duration: 0.6, delay: i * 0.1, ease: "power2.out" 
                }
            );
        });

        // Animate Logs
        gsap.utils.toArray('.log-entry').forEach((log, i) => {
            gsap.fromTo(log,
                { x: -50, opacity: 0 },
                {
                    scrollTrigger: { trigger: log, start: "top 90%" },
                    x: 0, opacity: 1, duration: 0.6, ease: "power2.out"
                }
            );
        });
        
        // Animate Vision Container
        gsap.fromTo('.vision-container', 
            { scale: 0.9, opacity: 0 },
            {
                scrollTrigger: { trigger: '#vision', start: "top 75%" },
                scale: 1, opacity: 1, duration: 1, ease: "power2.out"
            }
        );
    }
}, 100);


// --- 2. CUSTOM ROBOTIC CURSOR ---
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

if(cursorDot && cursorOutline) {
    window.addEventListener("mousemove", function (e) {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });

    const clickables = document.querySelectorAll('a, button, .research-card, .project-card, .skill-category');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// --- 3. THREE.JS SCENE ---
const container = document.getElementById('canvas-container');

if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.2, 4);
    const material = new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.015, transparent: true, opacity: 0.6 });
    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);

    const wireGeo = new THREE.IcosahedronGeometry(1.21, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x7000ff, wireframe: true, transparent: true, opacity: 0.2 });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.enableZoom = false; 
    controls.autoRotate = true; 
    controls.autoRotateSpeed = 1.5;

    function animate() {
        requestAnimationFrame(animate);
        sphere.rotation.y += 0.001;
        wireframe.rotation.x -= 0.001;
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
