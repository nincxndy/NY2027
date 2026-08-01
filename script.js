import { db, collection, onSnapshot, query, orderBy } from './firebase-config.js';

let isSoundPlaying = false;
let dayBox = document.getElementById("day-box");
let hrBox = document.getElementById("hr-box");
let minBox = document.getElementById("min-box");
let secBox = document.getElementById("sec-box");

let endDate = new Date(2027, 0, 1, 0, 0, 0); 
let endTime = endDate.getTime();

let s10m = document.getElementById("sound-10min");
let s5m = document.getElementById("sound-5min");
let s1m = document.getElementById("sound-1min");
let s10s = document.getElementById("countdown_10s");
let alert10 = false, alert5 = false, alert1 = false;
let addZeroes = (num) => (num < 10 ? `0${num}` : num);

const startOverlay = document.getElementById("start-overlay");
const mainWrapper = document.getElementById("main-wrapper");

let userContributions = [];
let currentIndex = 0; // ตัวนับลำดับการแสดงผล

// 1. ดึงข้อมูล Real-time จาก Firebase (เรียงจากเก่าไปใหม่ asc)
function loadWishesFromFirebase() {
  try {
    const wishesRef = collection(db, "wishes");
    const q = query(wishesRef, orderBy("createdAt", "asc")); // เรียงจากเก่าไปใหม่สุด

    onSnapshot(q, (snapshot) => {
      userContributions = [];
      snapshot.forEach((doc) => {
        userContributions.push(doc.data());
      });
      console.log(`อัปเดตข้อมูล Real-time สำเร็จ! มีทั้งหมด ${userContributions.length} รายการ`);
    }, (error) => {
      console.error("Firebase Error:", error);
    });
  } catch (err) {
    console.error("Error Setup Firebase Listener:", err);
  }
}

// 2. แสดงผลข้อความ/รูปภาพ สลับซ้าย-ขวา และค้าง 7.5 วินาที
function displaySequentialContribution() {
  let todayDate = new Date();
  let totalSecondsLeft = Math.floor((endTime - todayDate.getTime()) / 1000);
  if (totalSecondsLeft <= 300) return; 

  if (userContributions.length === 0) {
    setTimeout(displaySequentialContribution, 2000);
    return;
  }

  // ดึงข้อมูลตามลำดับ currentIndex
  const item = userContributions[currentIndex % userContributions.length];
  const itemNumber = currentIndex + 1; // ลำดับที่ 1, 2, 3...

  const card = document.createElement('div');
  card.className = 'random-card';

  // ตรวจสอบ ลำดับคี่/คู่ เพื่อจัดตำแหน่ง
  if (itemNumber % 2 !== 0) {
    // เลขคี่ -> มุมบนซ้าย
    card.classList.add('pos-top-left');
  } else {
    // เลขคู่ -> มุมบนขวา
    card.classList.add('pos-top-right');
  }

  // 2.1 แสดงชื่อผู้ส่ง
  const sender = document.createElement('div');
  sender.className = 'card-sender';
  sender.textContent = `👤 ${item.senderName || "ไม่ระบุชื่อ"}`;
  card.appendChild(sender);

  // 2.2 แสดงรูปภาพ (ถ้ามี)
  if (item.imageUrl && item.imageUrl.trim() !== "") {
    const img = document.createElement('img');
    img.src = item.imageUrl;
    card.appendChild(img);
  }

  // 2.3 แสดงข้อความ (ถ้ามี)
  if (item.message && item.message.trim() !== "") {
    const text = document.createElement('p');
    text.className = 'card-text';
    text.textContent = item.message;
    card.appendChild(text);
  }

  // 2.4 เพิ่มหลอดเวลาถอยหลัง (Progress Bar)
  const progressBar = document.createElement('div');
  progressBar.className = 'card-progress';
  card.appendChild(progressBar);

  document.body.appendChild(card);

  // ขยับ Index ไปยังคนถัดไป
  currentIndex++;

  // ค้างภาพไว้ 7.5 วินาที (7500ms) แล้วลบออก จากนั้นแสดงรายการถัดไป
  setTimeout(() => {
    card.remove();
  }, 7500);

  // เรียกทำงานรายการถัดไปหลังจากผ่านไป 7.5 วินาที
  setTimeout(displaySequentialContribution, 8000); 
}

// ฟังก์ชันเริ่มการทำงานหลัก
function startEverything() {
  console.log("กำลังเริ่มทำงาน...");

  if (startOverlay) {
    startOverlay.style.opacity = "0";
    setTimeout(() => {
      startOverlay.style.display = "none";
      if (mainWrapper) mainWrapper.style.opacity = "1";
    }, 800);
  }

  setInterval(countdown, 1000);
  countdown();
  
  if (typeof update === 'function') {
    update();
  }

  loadWishesFromFirebase();
  displaySequentialContribution();
}

// ผูก Event ปุ่มกด Start
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("start-btn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      startEverything();
    });
  } else {
    console.error("หาปุ่ม start-btn ไม่เจอ");
  }
});

// ฟังก์ชันเล่นเสียง
function playRepeatSound(audioElement) {
  if (!audioElement) return;
  let playCount = 0;
  const maxPlays = 3;
  const startPlaying = () => {
    audioElement.play()
      .then(() => { playCount++; })
      .catch(e => console.log("Audio play error:", e));
  };

  audioElement.onended = function() {
    if (playCount < maxPlays) {
      setTimeout(startPlaying, 1000);
    } else {
      audioElement.onended = null;
    }
  };
  setTimeout(startPlaying, 500);
}

function countdown() {
  let todayDate = new Date();
  let todayTime = todayDate.getTime();
  let remainingTime = endTime - todayTime;
  let totalSecondsLeft = Math.floor(remainingTime / 1000);

  if (totalSecondsLeft <= 600 && !alert10) { playRepeatSound(s10m); alert10 = true; }
  if (totalSecondsLeft <= 300 && !alert5) { playRepeatSound(s5m); alert5 = true; }
  if (totalSecondsLeft <= 60 && !alert1) { playRepeatSound(s1m); alert1 = true; }
  if (totalSecondsLeft <= 10 && totalSecondsLeft > 0 && !isSoundPlaying) {
    if (s10s) s10s.play();
    isSoundPlaying = true;
  }

  if (remainingTime <= 0) {
    window.location.href = "test.html";
  } else {
    let daysLeft = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
    let hrsLeft = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let minsLeft = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    let secsLeft = Math.floor((remainingTime % (60 * 1000)) / 1000);

    if (dayBox) dayBox.textContent = addZeroes(daysLeft);
    if (hrBox) hrBox.textContent = addZeroes(hrsLeft);
    if (minBox) minBox.textContent = addZeroes(minsLeft);
    if (secBox) secBox.textContent = addZeroes(secsLeft);
  }
}

// --- Fireworks Logic ---
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60); };
})();

var canvas = document.getElementById("canvas");
if (canvas) {
  var ctx = canvas.getContext("2d"),
    cw = window.innerWidth, ch = window.innerHeight,
    fireworks = [], particles = [], hue = 120, timerTotal = 80, timerTick = 0;

  canvas.width = cw; canvas.height = ch;

  function random(min, max) { return Math.random() * (max - min) + min; }
  function calculateDistance(p1x, p1y, p2x, p2y) {
    return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
  }

  function Firework(sx, sy, tx, ty) {
    this.x = sx; this.y = sy; this.sx = sx; this.sy = sy; this.tx = tx; this.ty = ty;
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;
    this.coordinates = [[sx, sy], [sx, sy], [sx, sy]];
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2; this.acceleration = 1.05; this.brightness = random(50, 70);
  }

  Firework.prototype.update = function (index) {
    this.coordinates.pop(); this.coordinates.unshift([this.x, this.y]);
    this.speed *= this.acceleration;
    var vx = Math.cos(this.angle) * this.speed, vy = Math.sin(this.angle) * this.speed;
    this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
    if (this.distanceTraveled >= this.distanceToTarget) {
      createParticles(this.tx, this.ty);
      fireworks.splice(index, 1);
    } else { this.x += vx; this.y += vy; }
  };

  Firework.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = "hsl(" + hue + ", 100%, " + this.brightness + "%)";
    ctx.stroke();
  };

  function Particle(x, y) {
    this.x = x; this.y = y;
    this.coordinates = [[x, y], [x, y], [x, y], [x, y], [x, y]];
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    this.friction = 0.95; this.gravity = 1;
    this.hue = random(hue - 50, hue + 50);
    this.brightness = random(50, 80);
    this.alpha = 1; this.decay = random(0.015, 0.03);
  }

  Particle.prototype.update = function (index) {
    this.coordinates.pop(); this.coordinates.unshift([this.x, this.y]);
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;
    if (this.alpha <= this.decay) { particles.splice(index, 1); }
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = "hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")";
    ctx.stroke();
  };

  function createParticles(x, y) {
    var count = 30; while (count--) { particles.push(new Particle(x, y)); }
  }

  function update() {
    requestAnimFrame(update);
    hue = random(0, 360);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "lighter";
    var i = fireworks.length; while (i--) { fireworks[i].draw(); fireworks[i].update(i); }
    var j = particles.length; while (j--) { particles[j].draw(); particles[j].update(j); }
    if (timerTick >= timerTotal) {
      fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
      timerTick = 0;
    } else { timerTick++; }
  }

  window.addEventListener("resize", () => {
    cw = window.innerWidth; ch = window.innerHeight;
    canvas.width = cw; canvas.height = ch;
  });
}
