import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize Animations
AOS.init({ duration: 800, once: true });

// --- THREE.JS HOLOGRAPHIC SPHERE ---
const container = document.getElementById('canvas-container');

if (container) {
    const scene = new THREE.Scene();
    
    // Camera Setup
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.2;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 1. The Point Cloud Sphere (Represents raw Lidar data)
    const geometry = new THREE.IcosahedronGeometry(1.2, 3); // Radius 1.2, Detail 3
    const material = new THREE.PointsMaterial({ 
        color: 0x00ffcc, // Cyan
        size: 0.015,
        transparent: true,
        opacity: 0.8
    });
    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);

    // 2. The Wireframe Geodesic (Represents processed mesh)
    const wireGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const wireMat = new THREE.MeshBasicMaterial({ 
        color: 0x7000ff, // Purple
        wireframe: true, 
        transparent: true, 
        opacity: 0.15
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    // Interactive Controls (Mouse rotate)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Add subtle complex rotation
        sphere.rotation.y += 0.001;
        wireframe.rotation.x -= 0.001;
        
        // "Breathing" pulse effect
        const time = Date.now() * 0.001;
        sphere.scale.setScalar(1 + Math.sin(time * 2) * 0.03);

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        if(container) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
}

// --- PROJECT DATA INJECTION ---
const projects = [
  {
    title: "Humanoid Whole-Body Motion Planning",
    tags: ["Drake", "MoveIt", "TrajOpt"],
    desc: "Balance-constrained reaching and manipulation with HRP-4 humanoid. Enforced ZMP constraints and optimized safe trajectories.",
    repo: "https://github.com/ansh1113/Humanoid-Motion-Planning"
  },
  {
    title: "Terrain-Aware Locomotion Pipeline",
    tags: ["ROS2", "Isaac Sim", "Elevation Mapping"],
    desc: "Quadruped locomotion pipeline with terrain classification. Reduced fall rates by 50% vs blind controllers.",
    repo: "https://github.com/ansh1113/Terrain-Aware-Locomotion-Pipeline-"
  },
  {
    title: "RL Locomotion + Safety Layer",
    tags: ["Isaac Gym", "PPO", "Control Barrier"],
    desc: "Safe quadruped locomotion policy using PPO with Control Barrier Functions (CBF) for zero-fall robustness.",
    repo: "https://github.com/ansh1113/RL-Locomotion-with-Safety-Layer"
  },
  {
    title: "VIO + Footstep Planner Fusion",
    tags: ["ROS2", "VINS-Fusion", "Nav2"],
    desc: "Fused Visual-Inertial Odometry with footstep planning for GPS-denied navigation. Reduced localization drift by 60%.",
    repo: "https://github.com/ansh1113/VIO-Footstep-Planner-Fusion"
  },
  {
    title: "EMG-Controlled Prosthetic Arm",
    tags: ["ESP32", "Python ML", "Fusion 360"],
    desc: "Low-latency prosthetic arm using EMG signal processing and XGBoost for real-time gesture classification.",
    repo: "https://www.youtube.com/shorts/bR4iVEo-3-U" // Keeping your youtube link
  },
  {
    title: "Quadruped Locomotion via PPO",
    tags: ["PyBullet", "PPO", "Python"],
    desc: "Trained ANYmal quadruped in simulation for terrain-adaptive locomotion with optimized reward functions.",
    repo: "https://github.com/ansh1113/Quadruped-Locomotion-via-PPO"
  }
];

const projectsGrid = document.getElementById('projectsGrid');
if (projectsGrid) {
    projects.forEach(p => {
        // Create tags HTML
        const tagsHTML = p.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // Determine link text based on URL
        const linkText = p.repo.includes('youtube') ? 'WATCH_DEMO' : 'ACCESS_SOURCE_CODE';
        const icon = p.repo.includes('youtube') ? '<i class="fab fa-youtube"></i>' : '<i class="fab fa-github"></i>';

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
