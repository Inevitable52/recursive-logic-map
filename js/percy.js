// percy.js — Fixed for seed rendering + G800.ULT compatibility

const canvas = document.getElementById('percyMap');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let logicSeeds = [];
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;

// G080–G900 ring spacing + ULT layer support
const rings = [
  { radius: 80, color: '#3fc1c9' },     // G080–G199
  { radius: 160, color: '#43d68d' },    // G200–G399
  { radius: 240, color: '#f9f871' },    // G400–G599
  { radius: 320, color: '#ffa07a' },    // G600–G799
  { radius: 400, color: '#c896fa' },    // G800–G900
];

function loadSeeds() {
  fetch('seeds.json')
    .then(res => res.json())
    .then(data => {
      logicSeeds = data.seeds.filter(seed => seed.id.startsWith('G'));
      drawSeeds();
    });
}

function drawSeeds() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ringBuckets = [[], [], [], [], []];
  logicSeeds.forEach(seed => {
    const num = parseInt(seed.id.replace('G', '').replace('.ULT', ''));
    if (num < 200) ringBuckets[0].push(seed);
    else if (num < 400) ringBuckets[1].push(seed);
    else if (num < 600) ringBuckets[2].push(seed);
    else if (num < 800) ringBuckets[3].push(seed);
    else ringBuckets[4].push(seed);
  });

  ringBuckets.forEach((bucket, i) => {
    const angleStep = (2 * Math.PI) / bucket.length;
    const { radius, color } = rings[i];

    bucket.forEach((seed, index) => {
      const angle = index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      seed.x = x;
      seed.y = y;
      drawNode(seed, color);
    });
  });
}

function drawNode(seed, color) {
  const label = seed.id;
  const isULT = seed.id.endsWith('.ULT');
  ctx.beginPath();
  ctx.arc(seed.x, seed.y, isULT ? 6 : 4, 0, 2 * Math.PI);
  ctx.fillStyle = isULT ? '#ff69b4' : color;
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = '10px monospace';
  ctx.fillText(label, seed.x + 8, seed.y + 2);
}

canvas.addEventListener('click', e => {
  const mx = e.clientX;
  const my = e.clientY;

  const clicked = logicSeeds.find(seed => {
    const dx = seed.x - mx;
    const dy = seed.y - my;
    return Math.sqrt(dx * dx + dy * dy) < 6;
  });

  if (clicked) {
    showSeedInfo(clicked);
  }
});

function showSeedInfo(seed) {
  const output = document.getElementById('percyThoughts');
  if (seed.id.endsWith('.ULT')) {
    output.innerText = `[${seed.id}] is ULT-protected. Details hidden.`;
  } else {
    output.innerText = `[${seed.id}] → ${seed.message}`;
  }
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
  drawSeeds();
});

loadSeeds();
