import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize Animations
AOS.init({ duration: 800, once: true });

// --- THREE.JS SCENE ---
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

// --- PROJECT DATA ---
const projects = [
  {
    title: "Humanoid Motion Planning",
    tags: ["Drake", "MoveIt"],
    desc: "Balance-constrained manipulation with HRP-4. Enforced ZMP constraints for stable reaching.",
    repo: "https://github.com/ansh1113/Humanoid-Motion-Planning"
  },
  {
    title: "Terrain-Aware Locomotion",
    tags: ["ROS2", "Elevation Mapping"],
    desc: "Quadruped perception pipeline. Reduced fall rates by 50% on uneven terrain using depth cameras.",
    repo: "https://github.com/ansh1113/Terrain-Aware-Locomotion-Pipeline-"
  },
  {
    title: "RL Locomotion + Safety",
    tags: ["Isaac Gym", "PPO", "CBF"],
    desc: "Reinforcement learning policy for quadruped walking, integrated with Safety Filter (CBF).",
    repo: "https://github.com/ansh1113/RL-Locomotion-with-Safety-Layer"
  },
  {
    title: "VIO + Footstep Fusion",
    tags: ["VINS-Fusion", "Nav2"],
    desc: "Fused Visual-Inertial Odometry with footstep planning for GPS-denied navigation.",
    repo: "https://github.com/ansh1113/VIO-Footstep-Planner-Fusion"
  },
  {
    title: "EMG Prosthetic Arm",
    tags: ["ESP32", "ML", "Fusion 360"],
    desc: "Real-time gesture classification using EMG signals and XGBoost on embedded hardware.",
    repo: "https://www.youtube.com/shorts/bR4iVEo-3-U"
  },
  {
    title: "Quadruped Sim (PPO)",
    tags: ["PyBullet", "PPO"],
    desc: "Trained ANYmal quadruped in simulation for robust terrain traversal.",
    repo: "https://github.com/ansh1113/Quadruped-Locomotion-via-PPO"
  }
];

const projectsGrid = document.getElementById('projectsGrid');
if (projectsGrid) {
    projects.forEach(p => {
        const tagsHTML = p.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        const linkText = p.repo.includes('youtube') ? 'WATCH_DEMO' : 'SOURCE_CODE';
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
