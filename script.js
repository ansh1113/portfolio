import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 1. CUSTOM ROBOTIC CURSOR ---
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

window.addEventListener("mousemove", function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows instantly
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with lag (robotic feeling)
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Add hover effect to clickable elements
const clickables = document.querySelectorAll('a, button, .research-card, .project-card');
clickables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});


// --- 2. GSAP SCROLL ANIMATIONS (The "Mechanical Slide") ---
gsap.registerPlugin(ScrollTrigger);

// Animate Section Headers (Slide Line)
gsap.utils.toArray('.line').forEach(line => {
    gsap.from(line, {
        scrollTrigger: { trigger: line, start: "top 80%" },
        scaleX: 0, transformOrigin: "left", duration: 1, ease: "power3.out"
    });
});

// Animate Research Cards (Slot in from right)
gsap.utils.toArray('.research-card').forEach((card, i) => {
    gsap.fromTo(card, 
        { x: 100, opacity: 0 },
        { 
            scrollTrigger: { trigger: card, start: "top 85%" },
            x: 0, opacity: 1, duration: 0.8, delay: i * 0.1, ease: "back.out(1.7)" 
        }
    );
});

// Animate Skill Categories (Slot in from bottom)
gsap.utils.toArray('.skill-category').forEach((cat, i) => {
    gsap.fromTo(cat, 
        { y: 50, opacity: 0 },
        { 
            scrollTrigger: { trigger: cat, start: "top 85%" },
            y: 0, opacity: 1, duration: 0.6, delay: i * 0.1, ease: "power2.out" 
        }
    );
});

// Animate Logs (Sequential fade)
gsap.utils.toArray('.log-entry').forEach((log, i) => {
    gsap.fromTo(log,
        { x: -50, opacity: 0 },
        {
            scrollTrigger: { trigger: log, start: "top 90%" },
            x: 0, opacity: 1, duration: 0.6, ease: "power2.out"
        }
    );
});

// --- 3. VISION TYPEWRITER EFFECT ---
const visionText = `
> # THE OBJECTIVE
The robotics industry is building calculators. I want to build the smartphone.

> # THE CONCEPT
"One Robot. Many Lives."
My vision is a Universal Chassis augmented by a Skill Ecosystem. Instead of single-purpose hardware, we need a core intelligence that can download "Physical Apps" - mastered skills for logistics, caregiving, or disaster response.

> # THE IMPLEMENTATION
The key is not just mechanics, but the Core Intelligence - an OS that translates human intent into flawless execution using verified skill blocks. This system must be built on a foundation of "Simulation-First" safety protocols.
`;

const typeWriterElement = document.getElementById('typewriter-text');
let hasTyped = false;

ScrollTrigger.create({
    trigger: "#vision",
    start: "top 60%",
    onEnter: () => {
        if (!hasTyped) {
            typeWriter(typeWriterElement, visionText);
            hasTyped = true;
        }
    }
});

function typeWriter(element, text, i = 0) {
    if (i < text.length) {
        if (text.substring(i, i+1) === '\n') {
            element.innerHTML += '<br>';
        } else {
            element.innerHTML += text.charAt(i);
        }
        setTimeout(() => typeWriter(element, text, i + 1), 20); // Typing speed
    }
}


// --- 4. THREE.JS SCENE (FIXED INTERACTIVITY) ---
const container = document.getElementById('canvas-container');

if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Particle Sphere
    const geometry = new THREE.IcosahedronGeometry(1.2, 4);
    const material = new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.015, transparent: true, opacity: 0.6 });
    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);

    // Wireframe Overlay
    const wireGeo = new THREE.IcosahedronGeometry(1.21, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x7000ff, wireframe: true, transparent: true, opacity: 0.2 });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enableZoom = false; controls.autoRotate = true; controls.autoRotateSpeed = 1.5;

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

// --- 5. PROJECT DATA INJECTION ---
const projects = [
  {
    title: "Quadruped Locomotion (RL)",
    tags: ["PPO", "Isaac Gym", "Python"],
    desc: "Trained ANYmal quadruped policies using Proximal Policy Optimization. Achieved robust traversal on irregular terrain with 0-fall safety constraints.",
    repo: "https://github.com/ansh1113/Quadruped-Locomotion-via-PPO"
  },
  {
    title: "VIO + Footstep Planning",
    tags: ["ROS2", "VINS-Fusion", "Nav2"],
    desc: "Fused Visual-Inertial Odometry with footstep planning. Enabled autonomous navigation in GPS-denied environments with <10cm drift.",
    repo: "https://github.com/ansh1113/VIO-Footstep-Planner-Fusion"
  },
  {
    title: "Humanoid Motion Planning",
    tags: ["Drake", "MoveIt", "C++"],
    desc: "Implemented whole-body motion planning for HRP-4. Enforced ZMP constraints for stable manipulation and reaching tasks.",
    repo: "https://github.com/ansh1113/Humanoid-Motion-Planning"
  },
  {
    title: "Terrain-Aware Navigation",
    tags: ["Elevation Mapping", "ROS2"],
    desc: "Developed a perception pipeline converting depth clouds to elevation maps for quadruped footstep placement.",
    repo: "https://github.com/ansh1113/Terrain-Aware-Locomotion-Pipeline-"
  },
  {
    title: "EMG Prosthetic Arm",
    tags: ["ESP32", "TinyML", "Fusion 360"],
    desc: "Built a 5-DOF prosthetic arm controlled by EMG signals. Used XGBoost on ESP32 for real-time gesture classification.",
    repo: "https://www.youtube.com/shorts/bR4iVEo-3-U"
  },
  {
    title: "RL Locomotion + Safety",
    tags: ["Control Barrier Functions"],
    desc: "Integrated CBF as a safety filter for RL policies to guarantee stability during training.",
    repo: "https://github.com/ansh1113/RL-Locomotion-with-Safety-Layer"
  }
];

const projectsGrid = document.getElementById('projectsGrid');
if (projectsGrid) {
    projects.forEach(p => {
        const tagsHTML = p.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        const linkText = p.repo.includes('youtube') ? 'WATCH_DEMO' : 'SOURCE_CODE';
        const icon = p.repo.includes('youtube') ? '<i class="fab fa-youtube"></i>' : '<i class="fab fa-github"></i>';

        // Add 'project-card' class for animation targeting
        projectsGrid.innerHTML += `
            <div class="project-card" data-aos="fade-up">
                <h3>${p.title}</h3>
                <div class="tags">${tagsHTML}</div>
                <p class="project-desc">${p.desc}</p>
                <div class="project-links">
                    <a href="${p.repo}" target="_blank">${icon} ${linkText}</a>
                </div>
            </div>
        `;
    });
}
