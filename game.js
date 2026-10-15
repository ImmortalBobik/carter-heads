
// Game Configuration & Constants (Tuned for balanced, smoother, slower pace)
const PITCH_WIDTH = 1000;
const PITCH_HEIGHT = 560;
const GROUND_Y = 485;
const GRAVITY = 0.32; // Slower, floatier gravity for better reaction time
const BALL_BOUNCE = 0.72;
const GOAL_WIDTH = 85;
const GOAL_HEIGHT = 200; // Crossbar at GROUND_Y - GOAL_HEIGHT = 285
const CROSSBAR_Y = GROUND_Y - GOAL_HEIGHT;

const CARTER_QUOTES = [
  "SPECS CHECKED & APPROVED! 💻",
  "144 FPS BICYCLE KICK! ⚽",
  "UNBOXED IN THE TOP CORNER! 🔥",
  "LIQUID COOLED FINISH! 💧",
  "BENCHMARK HIGH SCORE! 🚀",
  "THAT WAS RUNNING ON 4K ULTRA! ⚡"
];

const TRUMP_QUOTES = [
  "HUGE GOAL! THE GREATEST IN HISTORY! 🏆",
  "24K SOLID GOLD FINISH! 📱",
  "NO TARIFFS ON THAT STRIKE! 🇺🇸",
  "UNBELIEVABLE SHOT, FOLKS! 🌟",
  "BILLIONS AND BILLIONS OF POINTS! 💰",
  "MADE WITH PURE LUXURY! ✨"
];

// Load Images
const carterImg = new Image();
carterImg.src = './assets/carter_head.png';

const trumpImg = new Image();
trumpImg.src = './assets/trump_phone.png';

// Particle class for confetti and trails
class Particle {
  constructor(x, y, color, vx, vy, size = 6, shape = 'rect') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.shape = shape;
    this.alpha = 1;
    this.decay = 0.012 + Math.random() * 0.015;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // gravity
    this.rotation += this.vRot;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// PowerUp Pill
class PowerUp {
  constructor(type, x, y) {
    this.type = type; // 'speed', 'jump', 'freeze', 'bighead'
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.radius = 20;
    this.time = 0;
    this.collected = false;
  }

  update() {
    this.time += 0.05;
    this.y = this.baseY + Math.sin(this.time) * 8;
  }

  draw(ctx) {
    if (this.collected) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Outer glow
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    // Circle body
    const grad = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
    if (this.type === 'speed') {
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(1, '#ef4444');
    } else if (this.type === 'freeze') {
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, '#2563eb');
    } else if (this.type === 'bighead') {
      grad.addColorStop(0, '#a855f7');
      grad.addColorStop(1, '#ec4899');
    } else {
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(1, '#059669');
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon text
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let icon = '⚡';
    if (this.type === 'freeze') icon = '🧊';
    if (this.type === 'bighead') icon = '🧠';
    if (this.type === 'jump') icon = '🦘';
    ctx.fillText(icon, 0, 1);

    ctx.restore();
  }
}

// Soccer Ball class
class Ball {
  constructor(x, y) {
    this.radius = 17;
    this.reset(x, y);
  }

  reset(x = PITCH_WIDTH / 2, y = 200) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2; // Slower initial launch
    this.vy = -2.2;
    this.rotation = 0;
    this.vRot = 0;
    this.trail = [];
    this.onFire = false;
  }

  update() {
    // Gravity and physics (slower pace, higher air damping)
    this.vy += GRAVITY;
    this.vx *= 0.988; // gentle air friction
    this.vy *= 0.990;

    // Clamp max velocity so ball remains readable and controllable
    const speed = Math.hypot(this.vx, this.vy);
    const maxSpeed = 11.0;
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Spin
    this.vRot = this.vx * 0.04;
    this.rotation += this.vRot;

    // Trail
    if (Math.abs(this.vx) > 5 || Math.abs(this.vy) > 5 || this.onFire) {
      this.trail.push({ x: this.x, y: this.y, alpha: 0.6 });
    }
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= 0.07;
      if (this.trail[i].alpha <= 0) {
        this.trail.splice(i, 1);
      }
    }

    // Ceiling collision
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = -this.vy * 0.65;
    }

    // Ground bounce
    if (this.y + this.radius >= GROUND_Y) {
      this.y = GROUND_Y - this.radius;
      this.vy = -this.vy * BALL_BOUNCE;
      this.vx *= 0.88; // ground friction
      if (Math.abs(this.vy) < 0.6) this.vy = 0;
    }

    // Pitch Walls collision (above goal crossbar)
    // Left outer wall
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = -this.vx * BALL_BOUNCE;
    }
    // Right outer wall
    if (this.x + this.radius > PITCH_WIDTH) {
      this.x = PITCH_WIDTH - this.radius;
      this.vx = -this.vx * BALL_BOUNCE;
    }

    // Goal Post & Crossbar Collisions
    this.handleGoalCollisions();
  }

  handleGoalCollisions() {
    // Left Goal Crossbar: from x=0 to x=GOAL_WIDTH at y=CROSSBAR_Y
    // Crossbar tip is at (GOAL_WIDTH, CROSSBAR_Y)
    const leftTip = { x: GOAL_WIDTH, y: CROSSBAR_Y };
    this.collideWithPoint(leftTip.x, leftTip.y, 8);

    // Crossbar top horizontal bar collision
    if (this.x <= GOAL_WIDTH + 5) {
      if (this.y + this.radius >= CROSSBAR_Y - 6 && this.y - this.radius <= CROSSBAR_Y + 6) {
        if (this.vy > 0 && this.y < CROSSBAR_Y) {
          this.y = CROSSBAR_Y - 6 - this.radius;
          this.vy = -this.vy * BALL_BOUNCE;
        } else if (this.vy < 0 && this.y > CROSSBAR_Y) {
          this.y = CROSSBAR_Y + 6 + this.radius;
          this.vy = -this.vy * BALL_BOUNCE;
        }
      }
    }

    // Right Goal Crossbar tip at (PITCH_WIDTH - GOAL_WIDTH, CROSSBAR_Y)
    const rightTip = { x: PITCH_WIDTH - GOAL_WIDTH, y: CROSSBAR_Y };
    this.collideWithPoint(rightTip.x, rightTip.y, 8);

    if (this.x >= PITCH_WIDTH - GOAL_WIDTH - 5) {
      if (this.y + this.radius >= CROSSBAR_Y - 6 && this.y - this.radius <= CROSSBAR_Y + 6) {
        if (this.vy > 0 && this.y < CROSSBAR_Y) {
          this.y = CROSSBAR_Y - 6 - this.radius;
          this.vy = -this.vy * BALL_BOUNCE;
        } else if (this.vy < 0 && this.y > CROSSBAR_Y) {
          this.y = CROSSBAR_Y + 6 + this.radius;
          this.vy = -this.vy * BALL_BOUNCE;
        }
      }
    }

    // Goal nets back boundary
    // Inside Left Goal net
    if (this.x - this.radius < 10 && this.y > CROSSBAR_Y) {
      this.x = 10 + this.radius;
      this.vx = -this.vx * 0.3; // dampen in net
    }
    // Inside Right Goal net
    if (this.x + this.radius > PITCH_WIDTH - 10 && this.y > CROSSBAR_Y) {
      this.x = PITCH_WIDTH - 10 - this.radius;
      this.vx = -this.vx * 0.3;
    }
  }

  collideWithPoint(px, py, pradius = 8) {
    const dx = this.x - px;
    const dy = this.y - py;
    const dist = Math.hypot(dx, dy);
    const minDist = this.radius + pradius;
    if (dist < minDist && dist > 0.001) {
      const nx = dx / dist;
      const ny = dy / dist;
      this.x = px + nx * minDist;
      this.y = py + ny * minDist;

      // reflect velocity
      const dot = this.vx * nx + this.vy * ny;
      this.vx = (this.vx - 2 * dot * nx) * BALL_BOUNCE;
      this.vy = (this.vy - 2 * dot * ny) * BALL_BOUNCE;
    }
  }

  draw(ctx) {
    // Draw trail
    this.trail.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.5;
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * (0.6 + t.alpha * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = this.onFire ? '#f97316' : '#94a3b8';
      ctx.fill();
      ctx.restore();
    });

    // Draw soccer ball
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Ball shadow on ground
    if (this.y < GROUND_Y - this.radius) {
      const groundDist = GROUND_Y - this.y;
      const shadowScale = Math.max(0.3, 1 - groundDist / 350);
      ctx.save();
      ctx.scale(shadowScale, shadowScale * 0.3);
      ctx.beginPath();
      ctx.arc(0, groundDist / shadowScale / 0.3, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fill();
      ctx.restore();
    }

    // Outer circle
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Soccer pentagon patterns
    ctx.fillStyle = '#1e293b';
    // Center pentagon
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const ang = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const r = this.radius * 0.45;
      const px = Math.cos(ang) * r;
      const py = Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Spokes to outer rim
    for (let i = 0; i < 5; i++) {
      const ang = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const px = Math.cos(ang) * this.radius * 0.45;
      const py = Math.sin(ang) * this.radius * 0.45;
      const px2 = Math.cos(ang) * this.radius;
      const py2 = Math.sin(ang) * this.radius;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px2, py2);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Shading highlight
    const highlight = ctx.createRadialGradient(-this.radius * 0.4, -this.radius * 0.4, 2, 0, 0, this.radius);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    highlight.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Player Character class (Soccer Head)
class Player {
  constructor(id, name, isLeft, image, primaryColor, secondaryColor) {
    this.id = id;
    this.name = name;
    this.isLeft = isLeft;
    this.image = image;
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;

    this.headRadius = 40;
    this.width = 80;
    this.height = 95;

    // Movement attributes (slower, smoother control)
    this.speed = 4.8;
    this.jumpForce = 9.8;

    // Status / powerups
    this.speedTimer = 0;
    this.freezeTimer = 0;
    this.bigHeadTimer = 0;

    // Kicking
    this.kicking = false;
    this.kickProgress = 0; // 0 to 1
    this.kickAngle = 0;

    // Facing direction: 1 for right, -1 for left
    this.facing = isLeft ? 1 : -1;

    this.reset();
  }

  reset() {
    this.x = this.isLeft ? 240 : PITCH_WIDTH - 240;
    this.y = GROUND_Y - this.height;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = true;
    this.kicking = false;
    this.kickProgress = 0;
    this.kickAngle = 0;
    this.headBob = 0;
    this.headTilt = 0;
    this.speedTimer = 0;
    this.freezeTimer = 0;
    this.bigHeadTimer = 0;
    this.headRadius = 40;
  }

  jump() {
    if (this.freezeTimer > 0) return;
    if (this.isGrounded) {
      this.vy = -this.jumpForce;
      this.isGrounded = false;
    }
  }

  kick() {
    if (this.freezeTimer > 0) return;
    if (!this.kicking) {
      this.kicking = true;
      this.kickProgress = 0;
    }
  }

  update(leftKey, rightKey, jumpKey, kickKey) {
    // Handle Power-up timers
    if (this.speedTimer > 0) this.speedTimer--;
    if (this.freezeTimer > 0) {
      this.freezeTimer--;
      // Frozen: cannot move
      this.vx = 0;
      return;
    }
    if (this.bigHeadTimer > 0) {
      this.bigHeadTimer--;
      this.headRadius = 55;
    } else {
      this.headRadius = 40;
    }

    const currentSpeed = this.speedTimer > 0 ? this.speed * 1.45 : this.speed;

    // Horizontal control
    if (leftKey) {
      this.vx = -currentSpeed;
      this.headTilt = -0.12 * this.facing;
    } else if (rightKey) {
      this.vx = currentSpeed;
      this.headTilt = 0.12 * this.facing;
    } else {
      this.vx *= 0.7;
      this.headTilt *= 0.8;
    }

    if (jumpKey) {
      this.jump();
    }

    if (kickKey) {
      this.kick();
    }

    // Apply gravity
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Ground collision
    if (this.y + this.height >= GROUND_Y) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      this.isGrounded = true;
    }

    // Pitch Boundaries
    const minX = GOAL_WIDTH + this.headRadius;
    const maxX = PITCH_WIDTH - GOAL_WIDTH - this.headRadius;

    // Also prevent leaving pitch or entering wrong goal back
    if (this.x < 20 + this.headRadius) {
      this.x = 20 + this.headRadius;
      this.vx = 0;
    }
    if (this.x > PITCH_WIDTH - 20 - this.headRadius) {
      this.x = PITCH_WIDTH - 20 - this.headRadius;
      this.vx = 0;
    }

    // Midfield boundary: soft limit so players primarily duel around midfield
    // (In Sports Heads, players can cross slightly or have territory)
    if (this.isLeft) {
      if (this.x > PITCH_WIDTH - GOAL_WIDTH - 40) this.x = PITCH_WIDTH - GOAL_WIDTH - 40;
    } else {
      if (this.x < GOAL_WIDTH + 40) this.x = GOAL_WIDTH + 40;
    }

    // Kick Animation Progress
    if (this.kicking) {
      this.kickProgress += 0.15;
      // Shoe swings up and returns
      if (this.kickProgress <= 0.5) {
        this.kickAngle = (this.kickProgress / 0.5) * -1.1; // swing forward
      } else if (this.kickProgress <= 1.0) {
        this.kickAngle = (1 - (this.kickProgress - 0.5) / 0.5) * -1.1;
      } else {
        this.kicking = false;
        this.kickProgress = 0;
        this.kickAngle = 0;
      }
    }

    // Head bobbing when walking
    if (Math.abs(this.vx) > 0.5 && this.isGrounded) {
      this.headBob = Math.sin(Date.now() * 0.015) * 3;
    } else {
      this.headBob = 0;
    }
  }

  // Get shoe hitbox in world coordinates
  getShoePosition() {
    const footBaseX = this.x + this.facing * 22;
    const footBaseY = this.y + this.height - 12;
    
    // Rotate with kickAngle
    const kickOffsetRadius = 26;
    const effectiveAngle = (this.facing === 1) ? this.kickAngle : -this.kickAngle;
    const shoeX = footBaseX + Math.cos(effectiveAngle) * kickOffsetRadius * this.facing;
    const shoeY = footBaseY + Math.sin(effectiveAngle) * kickOffsetRadius;
    return { x: shoeX, y: shoeY, radius: 16 };
  }

  // Check and resolve collisions with the ball
  checkBallCollision(ball) {
    const headCenter = {
      x: this.x,
      y: this.y + this.headRadius + this.headBob - 5
    };

    // 1. Head vs Ball (Circle - Circle)
    const dx = ball.x - headCenter.x;
    const dy = ball.y - headCenter.y;
    const dist = Math.hypot(dx, dy);
    const minDist = this.headRadius + ball.radius;

    if (dist < minDist && dist > 0.001) {
      const nx = dx / dist;
      const ny = dy / dist;

      // Move ball out of collision
      ball.x = headCenter.x + nx * minDist;
      ball.y = headCenter.y + ny * minDist;

      // Transfer momentum & bounce (calibrated for smoother pace)
      const relativeVx = ball.vx - this.vx;
      const relativeVy = ball.vy - this.vy;
      const impulse = -(1 + BALL_BOUNCE) * (relativeVx * nx + relativeVy * ny);

      ball.vx += nx * Math.max(impulse * 0.7, 1.8) + this.vx * 0.45;
      ball.vy += ny * Math.max(impulse * 0.7, 1.8) + this.vy * 0.45;

      // Add a slight upward loft to head bounces
      if (ny > -0.2) {
        ball.vy = Math.min(ball.vy, -3.8);
      }

    }

    // 2. Shoe vs Ball (Kicking)
    const shoe = this.getShoePosition();
    const sDx = ball.x - shoe.x;
    const sDy = ball.y - shoe.y;
    const sDist = Math.hypot(sDx, sDy);
    const minShoeDist = shoe.radius + ball.radius;

    if (sDist < minShoeDist) {
      const sNx = sDx / (sDist || 1);
      const sNy = sDy / (sDist || 1);

      ball.x = shoe.x + sNx * minShoeDist;
      ball.y = shoe.y + sNy * minShoeDist;

      // If actively kicking, launch with smooth controlled power
      if (this.kicking) {
        const kickPower = 10.5;
        ball.vx = this.facing * kickPower + (Math.random() - 0.5) * 1.5;
        ball.vy = -5.8 - Math.random() * 2.0;
      } else {
        // Normal contact bounce with foot
        ball.vx = this.facing * 4.2 + this.vx * 0.4;
        ball.vy = -3.2;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Ground shadow
    ctx.beginPath();
    ctx.ellipse(0, this.height, 34, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fill();

    // Ice block if frozen
    if (this.freezeTimer > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.fillRect(-this.headRadius - 10, -5, (this.headRadius + 10) * 2, this.height + 15);
      ctx.strokeRect(-this.headRadius - 10, -5, (this.headRadius + 10) * 2, this.height + 15);
      ctx.restore();
    }

    // Draw Small Jersey Body
    const bodyY = this.headRadius * 2 - 12;
    ctx.save();
    // Jersey
    ctx.fillStyle = this.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-20, bodyY, 40, 26, 6);
    ctx.fill();
    ctx.strokeStyle = this.secondaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Jersey detail
    ctx.fillStyle = this.secondaryColor;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.isLeft ? "CPCS" : "T1", 0, bodyY + 16);
    ctx.restore();

    // Draw Shoe / Cleat
    const footBaseX = this.facing * 18;
    const footBaseY = this.height - 10;
    ctx.save();
    ctx.translate(footBaseX, footBaseY);
    ctx.rotate(this.facing === 1 ? this.kickAngle : -this.kickAngle);

    // Cleat / Boot
    ctx.fillStyle = this.secondaryColor;
    ctx.beginPath();
    ctx.roundRect(this.facing === 1 ? -12 : -18, -10, 30, 16, 6);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cleat laces / studs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.facing === 1 ? -2 : -6, -8, 8, 3);
    ctx.restore();

    // Draw Head (Real Photo Sprite)
    ctx.save();
    ctx.translate(0, this.headRadius + this.headBob - 8);
    ctx.rotate(this.headTilt);

    // Mirror image if facing left (or right for Trump phone)
    if (this.facing === -1) {
      ctx.scale(-1, 1);
    }

    const headDiameter = this.headRadius * 2.2;
    const headDrawY = -this.headRadius * 1.1;
    const headDrawX = -headDiameter / 2;

    if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
      // Glow effect if speed boost active
      if (this.speedTimer > 0) {
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 18;
      }
      ctx.drawImage(this.image, headDrawX, headDrawY, headDiameter, headDiameter);
    } else {
      // Fallback stylized head circle if image loading
      ctx.beginPath();
      ctx.arc(0, 0, this.headRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.primaryColor;
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();

    // Player Name Tag overhead (Clean modern pill badge)
    ctx.save();
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tagText = this.name;
    const tagWidth = ctx.measureText(tagText).width + 16;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = this.primaryColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-tagWidth / 2, -28, tagWidth, 20, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.fillText(tagText, 0, -18);
    ctx.restore();

    ctx.restore();
  }
}

// Main Game Controller
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Scale canvas to device pixel ratio for crystal clear rendering
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Game state
    this.isTwoPlayer = false;
    this.aiDifficulty = 'medium'; // 'easy', 'medium', 'savage'
    this.carterScore = 0;
    this.trumpScore = 0;
    this.matchTime = 60; // 60 seconds
    this.gameRunning = false;
    this.isPaused = false;
    this.isGameOver = false;

    // Celebration & messages
    this.celebrationBanner = null; // { text, subtitle, timer, color }
    this.confetti = [];
    this.powerUps = [];
    this.powerUpSpawnTimer = 0;

    // Entities
    this.ball = new Ball(PITCH_WIDTH / 2, 220);
    this.carter = new Player('p1', 'CARTER PCs', true, carterImg, '#0284c7', '#38bdf8');
    this.trump = new Player('p2', 'TRUMP T1 PHONE', false, trumpImg, '#d97706', '#fbbf24');

    // Key inputs
    this.keys = {};
    this.setupInputListeners();

    // Touch controls state
    this.touchControls = {
      p1Left: false,
      p1Right: false,
      p1Jump: false,
      p1Kick: false
    };

    // Game loop
    this.lastTime = performance.now();
    this.timerInterval = null;
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = PITCH_WIDTH * dpr;
    this.canvas.height = PITCH_HEIGHT * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'KeyP') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  start() {
    this.carterScore = 0;
    this.trumpScore = 0;
    this.matchTime = 60;
    this.isGameOver = false;
    this.isPaused = false;
    this.celebrationBanner = null;
    this.confetti = [];
    this.powerUps = [];
    this.resetPositions();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && !this.isGameOver && this.gameRunning) {
        this.matchTime--;
        if (this.matchTime <= 5 && this.matchTime > 0) {
        }
        if (this.matchTime <= 0) {
          this.endGame();
        }
        this.updateUI();
      }
    }, 1000);

    this.gameRunning = true;
    this.updateUI();

    requestAnimationFrame((t) => this.loop(t));
  }

  resetPositions() {
    this.ball.reset(PITCH_WIDTH / 2, 200);
    this.carter.reset();
    this.trump.reset();
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    const pauseEl = document.getElementById('pauseOverlay');
    if (pauseEl) {
      pauseEl.classList.toggle('hidden', !this.isPaused);
    }
  }

  triggerGoal(scorer) {

    let text = "";
    let subtitle = "";
    let color = "#38bdf8";

    if (scorer === 'carter') {
      this.carterScore++;
      text = "GOAL FOR CARTER PCs!";
      subtitle = CARTER_QUOTES[Math.floor(Math.random() * CARTER_QUOTES.length)];
      color = "#0ea5e9";
    } else {
      this.trumpScore++;
      text = "GOAL FOR TRUMP MOBILE T1!";
      subtitle = TRUMP_QUOTES[Math.floor(Math.random() * TRUMP_QUOTES.length)];
      color = "#eab308";
    }

    this.celebrationBanner = {
      text,
      subtitle,
      timer: 140, // ~2.3 seconds
      color
    };

    // Explode Confetti
    const confColors = scorer === 'carter'
      ? ['#38bdf8', '#0284c7', '#ffffff', '#3b82f6', '#06b6d4']
      : ['#fbbf24', '#f59e0b', '#dc2626', '#ffffff', '#facc15'];

    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 5;
      const col = confColors[Math.floor(Math.random() * confColors.length)];
      this.confetti.push(new Particle(this.ball.x, this.ball.y, col, vx, vy, 6 + Math.random() * 6));
    }

    this.updateUI();
  }

  endGame() {
    this.isGameOver = true;
    this.gameRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const modal = document.getElementById('gameOverModal');
    const winnerTitle = document.getElementById('winnerTitle');
    const winnerSub = document.getElementById('winnerSub');
    const finalScore = document.getElementById('finalScoreText');

    if (this.carterScore > this.trumpScore) {
      winnerTitle.innerText = "🏆 CARTER PCs WINS!";
      winnerTitle.style.color = "#38bdf8";
      winnerSub.innerText = "Optimal FPS and benchmark victory over the golden T1!";
    } else if (this.trumpScore > this.carterScore) {
      winnerTitle.innerText = "🏆 TRUMP T1 PHONE WINS!";
      winnerTitle.style.color = "#eab308";
      winnerSub.innerText = "Tremendous win! The 24K luxury phone dominates the pitch!";
    } else {
      winnerTitle.innerText = "🤝 IT'S A DRAW!";
      winnerTitle.style.color = "#a855f7";
      winnerSub.innerText = "A historic clash of tech titans ends in a stalemate!";
    }

    if (finalScore) {
      finalScore.innerText = `${this.carterScore} - ${this.trumpScore}`;
    }
    if (modal) {
      modal.showModal();
    }
  }

  updateAI() {
    // Intelligent AI for Trump Mobile T1
    const ball = this.ball;
    const trump = this.trump;

    let moveLeft = false;
    let moveRight = false;
    let jump = false;
    let kick = false;

    // Target position: try to stay between ball and right goal (defense), or push forward to shoot
    let targetX = ball.x + 40;
    
    // AI Difficulty modifiers
    let reactionSpeed = 0.85;
    let jumpTendency = 0.8;
    if (this.aiDifficulty === 'easy') {
      reactionSpeed = 0.55;
      jumpTendency = 0.45;
    } else if (this.aiDifficulty === 'savage') {
      reactionSpeed = 0.98;
      jumpTendency = 0.95;
    }

    // Defensive positioning if ball is high or behind
    if (ball.x > trump.x) {
      // Ball got behind Trump! Rush back to protect goal!
      moveRight = true;
    } else {
      // Move to intercept or kick
      const dist = Math.abs(trump.x - targetX);
      if (dist > 18) {
        if (trump.x > targetX) {
          moveLeft = true;
        } else {
          moveRight = true;
        }
      }

      // Jump when ball is coming at head height or overhead
      if (ball.y < GROUND_Y - 90 && Math.abs(ball.x - trump.x) < 80) {
        if (Math.random() < jumpTendency) {
          jump = true;
        }
      }

      // Kick when ball is in front of the shoe
      if (ball.x < trump.x && ball.x > trump.x - 70 && Math.abs(ball.y - (GROUND_Y - 30)) < 70) {
        kick = true;
      }
    }

    return { moveLeft, moveRight, jump, kick };
  }

  update() {
    if (this.isPaused || this.isGameOver) return;

    // 1. Player 1 (Carter) Inputs (WASD or Touch or Arrows in 1P mode)
    const p1Left = this.keys['KeyA'] || (!this.isTwoPlayer && this.keys['ArrowLeft']) || this.touchControls.p1Left;
    const p1Right = this.keys['KeyD'] || (!this.isTwoPlayer && this.keys['ArrowRight']) || this.touchControls.p1Right;
    const p1Jump = this.keys['KeyW'] || (!this.isTwoPlayer && this.keys['ArrowUp']) || this.touchControls.p1Jump;
    const p1Kick = this.keys['Space'] || (!this.isTwoPlayer && this.keys['ArrowDown']) || this.touchControls.p1Kick;

    this.carter.update(p1Left, p1Right, p1Jump, p1Kick);

    // 2. Player 2 (Trump) Inputs (Arrows in 2P mode or AI in 1P mode)
    if (this.isTwoPlayer) {
      const p2Left = this.keys['ArrowLeft'];
      const p2Right = this.keys['ArrowRight'];
      const p2Jump = this.keys['ArrowUp'];
      const p2Kick = this.keys['ArrowDown'] || this.keys['Enter'];
      this.trump.update(p2Left, p2Right, p2Jump, p2Kick);
    } else {
      const ai = this.updateAI();
      this.trump.update(ai.moveLeft, ai.moveRight, ai.jump, ai.kick);
    }

    // 3. Ball Physics & Collisions
    this.ball.update();
    this.carter.checkBallCollision(this.ball);
    this.trump.checkBallCollision(this.ball);

    // 4. Power-ups spawn & collision
    this.powerUpSpawnTimer++;
    if (this.powerUpSpawnTimer > 500 && this.powerUps.length < 2) {
      this.powerUpSpawnTimer = 0;
      const types = ['speed', 'jump', 'freeze', 'bighead'];
      const chosen = types[Math.floor(Math.random() * types.length)];
      const px = 280 + Math.random() * (PITCH_WIDTH - 560);
      const py = 180 + Math.random() * 120;
      this.powerUps.push(new PowerUp(chosen, px, py));
    }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.update();

      // Ball hits power-up
      const dist = Math.hypot(this.ball.x - p.x, this.ball.y - p.y);
      if (dist < this.ball.radius + p.radius) {
        // Activate powerup for player closest to ball
        const distCarter = Math.hypot(this.carter.x - this.ball.x, this.carter.y - this.ball.y);
        const distTrump = Math.hypot(this.trump.x - this.ball.x, this.trump.y - this.ball.y);
        const recipient = distCarter < distTrump ? this.carter : this.trump;
        const opponent = distCarter < distTrump ? this.trump : this.carter;

        if (p.type === 'speed') recipient.speedTimer = 360;
        if (p.type === 'jump') { recipient.jumpForce = 15; setTimeout(() => recipient.jumpForce = 12, 6000); }
        if (p.type === 'freeze') opponent.freezeTimer = 160;
        if (p.type === 'bighead') recipient.bigHeadTimer = 360;

        this.powerUps.splice(i, 1);
      }
    }

    // 5. Goal Detection
    // Right Goal (Carter scores): ball completely inside x > PITCH_WIDTH - GOAL_WIDTH + 10, y > CROSSBAR_Y
    if (!this.celebrationBanner) {
      if (this.ball.x > PITCH_WIDTH - GOAL_WIDTH + 10 && this.ball.y > CROSSBAR_Y + 10) {
        this.triggerGoal('carter');
      } else if (this.ball.x < GOAL_WIDTH - 10 && this.ball.y > CROSSBAR_Y + 10) {
        this.triggerGoal('trump');
      }
    }

    // 6. Celebration countdown & reset
    if (this.celebrationBanner) {
      this.celebrationBanner.timer--;
      if (this.celebrationBanner.timer <= 0) {
        this.celebrationBanner = null;
        this.resetPositions();
      }
    }

    // 7. Confetti update
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      this.confetti[i].update();
      if (this.confetti[i].alpha <= 0) {
        this.confetti.splice(i, 1);
      }
    }
  }

  drawPitch() {
    const ctx = this.ctx;

    // Sky / Stadium background gradient (Clean, bright daylight sky)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#bae6fd'); // soft sky blue
    skyGrad.addColorStop(0.55, '#e0f2fe');
    skyGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);

    // Warm Sunbeam / Stadium Lighting
    ctx.save();
    [200, PITCH_WIDTH - 200].forEach(lx => {
      const beamGrad = ctx.createRadialGradient(lx, 10, 10, lx, 220, 360);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(lx - 140, GROUND_Y);
      ctx.lineTo(lx, 10);
      ctx.lineTo(lx + 140, GROUND_Y);
      ctx.fill();
    });
    ctx.restore();

    // Stadium Crowd Silhouettes (soft clean slate)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y - 40);
    for (let x = 0; x < PITCH_WIDTH; x += 15) {
      const h = Math.sin(x * 0.08) * 5 + Math.cos(x * 0.14) * 3;
      ctx.lineTo(x, GROUND_Y - 48 + h);
    }
    ctx.lineTo(PITCH_WIDTH, GROUND_Y);
    ctx.lineTo(0, GROUND_Y);
    ctx.fill();

    // Turf / Pitch Grass (Lush vibrant grass)
    const turfGrad = ctx.createLinearGradient(0, GROUND_Y, 0, PITCH_HEIGHT);
    turfGrad.addColorStop(0, '#22c55e');
    turfGrad.addColorStop(0.3, '#16a34a');
    turfGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = turfGrad;
    ctx.fillRect(0, GROUND_Y, PITCH_WIDTH, PITCH_HEIGHT - GROUND_Y);

    // Mowed grass striped pattern
    const stripeWidth = 50;
    for (let x = 0; x < PITCH_WIDTH; x += stripeWidth * 2) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x, GROUND_Y, stripeWidth, PITCH_HEIGHT - GROUND_Y);
    }

    // Pitch Lines (Crisp white lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3.5;

    // Ground touchline
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(PITCH_WIDTH, GROUND_Y);
    ctx.stroke();

    // Midfield Line
    ctx.beginPath();
    ctx.moveTo(PITCH_WIDTH / 2, GROUND_Y);
    ctx.lineTo(PITCH_WIDTH / 2, GROUND_Y - 140);
    ctx.stroke();

    // Midfield Circle
    ctx.beginPath();
    ctx.arc(PITCH_WIDTH / 2, GROUND_Y, 70, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Midfield Spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(PITCH_WIDTH / 2, GROUND_Y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw Left Goal (Carter's goal to defend)
    this.drawGoal(0, true);

    // Draw Right Goal (Trump's goal to defend)
    this.drawGoal(PITCH_WIDTH, false);
  }

  drawGoal(originX, isLeft) {
    const ctx = this.ctx;
    const postX = isLeft ? GOAL_WIDTH : originX - GOAL_WIDTH;
    const backX = isLeft ? 6 : originX - 6;

    // Goal Net Mesh
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    const step = 14;
    for (let y = CROSSBAR_Y; y <= GROUND_Y; y += step) {
      ctx.beginPath();
      ctx.moveTo(backX, y);
      ctx.lineTo(postX, y);
      ctx.stroke();
    }
    const xStep = (postX - backX) / 5;
    for (let i = 0; i <= 5; i++) {
      const gx = backX + i * xStep;
      ctx.beginPath();
      ctx.moveTo(gx, CROSSBAR_Y);
      ctx.lineTo(gx, GROUND_Y);
      ctx.stroke();
    }

    // Goal Frame (Posts & Crossbar) - Crisp Pure White
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // Back post
    ctx.beginPath();
    ctx.moveTo(backX, GROUND_Y);
    ctx.lineTo(backX, CROSSBAR_Y);
    ctx.stroke();

    // Crossbar
    ctx.beginPath();
    ctx.moveTo(backX, CROSSBAR_Y);
    ctx.lineTo(postX, CROSSBAR_Y);
    ctx.stroke();

    // Front upright post
    ctx.beginPath();
    ctx.moveTo(postX, CROSSBAR_Y);
    ctx.lineTo(postX, GROUND_Y);
    ctx.stroke();

    // Goal Post Cap
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(postX, CROSSBAR_Y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawCelebration() {
    if (!this.celebrationBanner) return;
    const ctx = this.ctx;
    const { text, subtitle, color } = this.celebrationBanner;

    ctx.save();
    ctx.translate(PITCH_WIDTH / 2, 140);

    // Banner Pill Box (Clean bright card)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-280, -45, 560, 90, 20);
    ctx.fill();
    ctx.stroke();

    // Glow
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 16;

    // Main Text
    ctx.font = '900 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.fillText(text, 0, -8);

    // Subtitle Quote
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.shadowBlur = 0;
    ctx.fillText(subtitle, 0, 22);

    ctx.restore();
  }

  render() {
    this.drawPitch();

    // Draw Power-ups
    this.powerUps.forEach(p => p.draw(this.ctx));

    // Draw Players
    this.carter.draw(this.ctx);
    this.trump.draw(this.ctx);

    // Draw Ball
    this.ball.draw(this.ctx);

    // Draw Confetti
    this.confetti.forEach(c => c.draw(this.ctx));

    // Draw Goal Celebration
    this.drawCelebration();
  }

  loop(currentTime) {
    if (!this.gameRunning) return;

    this.update();
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  updateUI() {
    const cScoreEl = document.getElementById('carterScore');
    const tScoreEl = document.getElementById('trumpScore');
    const timerEl = document.getElementById('matchTimer');

    if (cScoreEl) cScoreEl.innerText = this.carterScore;
    if (tScoreEl) tScoreEl.innerText = this.trumpScore;
    if (timerEl) {
      const mins = Math.floor(this.matchTime / 60);
      const secs = (this.matchTime % 60).toString().padStart(2, '0');
      timerEl.innerText = `${mins}:${secs}`;
    }
  }
}
