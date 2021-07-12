const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl");
const startBtn = document.querySelector("#startBtn");
const modelEL = document.querySelector("#modelEL");
const bigScoreEl = document.querySelector("#bigScoreEl");

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  update() {
    this.draw();
    this.y = this.y + this.velocity.y;
    this.x = this.x + this.velocity.x;
  }
}

// tao enemy
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  update() {
    this.draw();
    this.y = this.y + this.velocity.y;
    this.x = this.x + this.velocity.x;
  }
}

// tap cac hat bay ra khi ban = particle
const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.y = this.y + this.velocity.y;
    this.x = this.x + this.velocity.x;
    this.alpha -= 0.01;
  }
}

// cho player o giua man hinh
const x = canvas.width / 2;
const y = canvas.height / 2;

// khoi tao player
let player = new Player(x, y, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];

// ham reset
function init() {
  player = new Player(x, y, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML= score
  bigScoreEl.innerHTML= score
}

// ham loop , lap di lap lai nhieu lan
let animationId;
let score = 0;
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, 0.1";
  c.fillRect(0, 0, canvas.width, canvas.height); // xoa background sau moi lan render

  player.draw();

  // render particle
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, index) => {
    projectile.update();

    // remove from edges of sceen
    if (
      projectile.x + projectile.radius < 0 ||
      projectiles.x - projectiles.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectiles.y - projectiles.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();

    // end game

    // khoang cach player va enemy
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    // dung lai khi enemy cham player
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      modelEL.style.display = "flex";
      bigScoreEl.innerHTML = score;
    }

    projectiles.forEach((projectile, projectileIndex) => {
      // tính khoảng cách của đạn với enemy
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      // khi projectile touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // increase our score
        score += 100;
        scoreEl.innerHTML = score;
        // creat explosions : vu no
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }
        if (enemy.radius - 10 > 5) {
          // increase our score
          score += 100;
          scoreEl.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          // increase our score
          score += 250;
          scoreEl.innerHTML = score;
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

// ham xac dinh xuat phat cua enemy
function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 5) + 5;

    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    // radom color
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

// them su kien click chuot
addEventListener("click", (event) => {
  // tinh tan goc
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  //console.log(angle);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});

// khi click button start game
startBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  modelEL.style.display = "none";
});

//chay ham loop
animate();
spawnEnemies();
