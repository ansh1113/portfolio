// --- Interactive Robot Drawing ---
const canvas = document.getElementById('robotCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let eyeOffsetX = 0, eyeOffsetY = 0;
  let blink = false;

  function drawRobot() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#53a7f5"; ctx.fillRect(80, 80, 60, 70);
    ctx.fillStyle = "#233b6e"; ctx.fillRect(90, 50, 40, 40);
    if (!blink) {
      ctx.beginPath();
      ctx.arc(105 + eyeOffsetX, 70 + eyeOffsetY, 4, 0, 2 * Math.PI);
      ctx.arc(125 + eyeOffsetX, 70 + eyeOffsetY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff"; ctx.fill();
    } else {
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(101 + eyeOffsetX, 70 + eyeOffsetY);
      ctx.lineTo(109 + eyeOffsetX, 70 + eyeOffsetY);
      ctx.moveTo(121 + eyeOffsetX, 70 + eyeOffsetY);
      ctx.lineTo(129 + eyeOffsetX, 70 + eyeOffsetY);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(110, 50); ctx.lineTo(110, 35);
    ctx.strokeStyle = "#53a7f5"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(110, 33, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#53a7f5"; ctx.fill();
    ctx.fillStyle = "#233b6e"; ctx.fillRect(60, 100, 20, 10);
    ctx.fillRect(140, 100, 20, 10);
    ctx.fillRect(95, 150, 10, 25);
    ctx.fillRect(115, 150, 10, 25);
  }
  drawRobot();

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    eyeOffsetX = Math.max(-2, Math.min(2, (mx - 110) / 20));
    eyeOffsetY = Math.max(-2, Math.min(2, (my - 70) / 20));
    drawRobot();
  });
  canvas.addEventListener('mouseenter', () => {
    blink = true; drawRobot();
    setTimeout(() => { blink = false; drawRobot(); }, 350);
  });
  canvas.addEventListener('mouseleave', () => {
    eyeOffsetX = 0; eyeOffsetY = 0; blink = false; drawRobot();
  });
}

// --- Projects Data ---
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
    desc: "Quadruped locomotion pipeline with terrain classification and adaptive footstep planning.",
    repo: "https://github.com/ansh1113/Terrain-Aware-Locomotion-Pipeline-"
  },
  {
    title: "RL Locomotion with Safety Layer",
    tags: ["Isaac Gym", "PPO", "CBF"],
    desc: "Safe quadruped locomotion policy using PPO with Control Barrier Functions for zero-fall robustness.",
    repo: "https://github.com/ansh1113/RL-Locomotion-with-Safety-Layer"
  },
  {
    title: "VIO + Footstep Planner Fusion",
    tags: ["ROS2", "ORB-SLAM3", "VINS-Fusion"],
    desc: "Fused VIO with quadruped footstep planner. Implemented drift correction for reliable unknown-map navigation.",
    repo: "https://github.com/ansh1113/VIO-Footstep-Planner-Fusion"
  },
  {
    title: "EMG-Controlled Prosthetic Arm",
    tags: ["ESP32", "Python", "XGBoost", "Fusion 360"],
    desc: "Responsive prosthetic arm with EMG signal processing and ML-based real-time gesture classification.",
    live: "https://www.youtube.com/shorts/bR4iVEo-3-U"
  },
  {
    title: "Quadruped Locomotion via PPO",
    tags: ["PyBullet", "PPO"],
    desc: "Trained ANYmal quadruped in simulation for terrain-adaptive locomotion with reduced fall rate.",
    repo: "https://github.com/ansh1113/Quadruped-Locomotion-via-PPO"
  }
];

// --- Generate Project Cards ---
const projectsGrid = document.getElementById('projectsGrid');
if (projectsGrid) {
  projects.forEach(p => {
    const tagsHTML = p.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    const linksHTML = `
      <div class="project-links">
        ${p.repo ? `<a href="${p.repo}" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}
        ${p.live ? `<a href="${p.live}" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
      </div>
    `;
    projectsGrid.innerHTML += `
      <div class="project-card">
        <h3>${p.title}</h3>
        <div class="tags">${tagsHTML}</div>
        <p>${p.desc}</p>
        ${p.repo || p.live ? linksHTML : ''}
      </div>
    `;
  });
}

// --- Contact Form ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = contactForm.querySelector('input[name="name"]').value;
    const fromEmail = contactForm.querySelector('input[name="email"]').value;
    const message = contactForm.querySelector('textarea[name="message"]').value;
    const status = document.getElementById('formStatus');
    const subject = `Contact from Portfolio - ${name}`;
    const body = `You have a new message:\n\nName: ${name}\nEmail: ${fromEmail}\n\n${message}`;
    const mailtoLink = `mailto:anshbhansali5@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    status.textContent = "Opening your email client...";
    contactForm.reset();
    setTimeout(() => { status.textContent = ""; }, 5000);
  });
}

// --- Back to Top ---
const backToTopButton = document.getElementById('back-to-top');
if (backToTopButton) {
  window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      backToTopButton.style.display = "flex";
    } else {
      backToTopButton.style.display = "none";
    }
  };
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
