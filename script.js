// --- Interactive Robot Drawing ---
const canvas = document.getElementById('robotCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let eyeOffsetX = 0, eyeOffsetY = 0;
  let blink = false;

  function drawRobot() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Body
    ctx.fillStyle = "#53a7f5";
    ctx.fillRect(80, 80, 60, 70);

    // Head
    ctx.fillStyle = "#233b6e";
    ctx.fillRect(90, 50, 40, 40);

    // Eyes (with offset)
    ctx.beginPath();
    if (!blink) {
      ctx.arc(105 + eyeOffsetX, 70 + eyeOffsetY, 4, 0, 2 * Math.PI);
      ctx.arc(125 + eyeOffsetX, 70 + eyeOffsetY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
    } else {
      // Draw blink (lines)
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(101 + eyeOffsetX, 70 + eyeOffsetY);
      ctx.lineTo(109 + eyeOffsetX, 70 + eyeOffsetY);
      ctx.moveTo(121 + eyeOffsetX, 70 + eyeOffsetY);
      ctx.lineTo(129 + eyeOffsetX, 70 + eyeOffsetY);
      ctx.stroke();
    }

    // Antenna
    ctx.beginPath();
    ctx.moveTo(110, 50);
    ctx.lineTo(110, 35);
    ctx.strokeStyle = "#53a7f5";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(110, 33, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#53a7f5";
    ctx.fill();

    // Arms
    ctx.fillStyle = "#233b6e";
    ctx.fillRect(60, 100, 20, 10);
    ctx.fillRect(140, 100, 20, 10);

    // Legs
    ctx.fillRect(95, 150, 10, 25);
    ctx.fillRect(115, 150, 10, 25);
  }
  drawRobot();

  // Eye tracking
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    eyeOffsetX = Math.max(-2, Math.min(2, (mx - 110) / 20));
    eyeOffsetY = Math.max(-2, Math.min(2, (my - 70) / 20));
    drawRobot();
  });

  // Blink on hover
  canvas.addEventListener('mouseenter', () => {
    blink = true;
    drawRobot();
    setTimeout(() => {
      blink = false;
      drawRobot();
    }, 350);
  });
  canvas.addEventListener('mouseleave', () => {
    eyeOffsetX = 0; eyeOffsetY = 0;
    blink = false;
    drawRobot();
  });
}

// --- Projects Data ---
const projects = [
  {
    title: "EMG-Controlled Prosthetic Arm",
    tags: ["Fusion 360", "ESP32", "ML", "Python"],
    desc: "Responsive prosthetic arm with EMG signal processing and real-time gesture classification.",
    live: "https://www.youtube.com/shorts/bR4iVEo-3-U" // Added link
  },
  {
    title: "Voice-Controlled Search Assistant",
    tags: ["Python", "Whisper", "DistilBERT"],
    desc: "Multilingual voice system for robust intent classification and web search."
  },
  {
    title: "Multi-UAV Swarm Coordination",
    tags: ["PX4", "ROS2", "Gazebo"],
    desc: "UAV formation control and RL-based collision avoidance in simulation."
  },
  {
    title: "Quadruped RL Locomotion",
    tags: ["PyBullet", "PPO"],
    desc: "Trained quadruped (ANYmal) for stable gait across terrains using PPO."
  },
  {
    title: "Autonomous Medical Assistance Robot",
    tags: ["Fusion 360", "ROS2", "MoveIt"],
    desc: "Mobile robot with full autonomy stack and advanced perception for manipulation."
  }
];

// --- Generate Project Cards ---
const projectsGrid = document.getElementById('projectsGrid');
if (projectsGrid) {
  projects.forEach(p => {
    const tagsHTML = p.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    // NEW: Generate links HTML if links exist
    const linksHTML = `
        <div class="project-links">
            ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> Code</a>` : ''}
            ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
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

// --- Contact Form (mailto functionality) ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get the form data
    const name = contactForm.querySelector('input[name="name"]').value;
    const fromEmail = contactForm.querySelector('input[name="email"]').value;
    const message = contactForm.querySelector('textarea[name="message"]').value;
    const status = document.getElementById('formStatus');

    // Construct the mailto link
    const subject = `Contact from Portfolio - ${name}`;
    const body = `You have a new message from your portfolio contact form:\n\nName: ${name}\nEmail: ${fromEmail}\n\nMessage:\n${message}`;
    const mailtoLink = `mailto:anshbhansali5@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the user's default email client
    window.location.href = mailtoLink;

    // Provide feedback to the user
    status.textContent = "Opening your email client...";
    contactForm.reset();
    setTimeout(() => { status.textContent = ""; }, 5000);
  });
}

// --- Back to Top Button ---
const backToTopButton = document.getElementById('back-to-top');
if (backToTopButton) {
    window.onscroll = function() {
        // Show button if page is scrolled down more than 100px
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
