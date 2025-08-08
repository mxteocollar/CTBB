

AOS.init({ duration: 900, once: true });
tsParticles.load("tsparticles", {
  fullScreen: { enable: false },
  background: { color: "transparent" },
  particles: {
    number: { value: 60 },
    color: { value: "#66ccff" },
    shape: { type: "circle" },
    opacity: { value: 0.3 },
    size: { value: 2 },
    move: { enable: true, speed: 0.4 },
    links: {
      enable: true,
      distance: 100,
      color: "#66ccff",
      opacity: 0.2,
      width: 1
    }
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "repulse" },
      resize: true
    },
    modes: { repulse: { distance: 80 } }
  },
  detectRetina: true
});

const startBtn = document.getElementById('startBtn');
const menu = document.getElementById('menu');
const game = document.getElementById('game');
const backBtn = document.getElementById('backBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const bigBall = document.getElementById('bigBall');
const clickMultiplierLevelEl = document.getElementById('clickMultiplierLevel');
const clickMultiplierCostEl = document.getElementById('clickMultiplierCost');
const buyClickMultiplierBtn = document.getElementById('buyClickMultiplierBtn');
const autoClickerLevelEl = document.getElementById('autoClickerLevel');
const autoClickerCostEl = document.getElementById('autoClickerCost');
const buyAutoClickerBtn = document.getElementById('buyAutoClickerBtn');

let score = 0;
let clickMultiplierLevel = 0;
let autoClickerLevel = 0;
const MAX_LEVEL = 999;
let clickMultiplierCost = 10;
let autoClickerCost = 25;
let clicksPerClick = 1;
let clicksPerSecond = 0;

let totalClicks = 0;
let totalUpgrades = 0;
let gameStartTime = Date.now();
let lastClickTime = 0;
let recentClicks = [];
let idleStartTime = null;
let afkStartTime = null;
let isIdle = false;
let isAFK = false;

function updateUI() {
  scoreDisplay.textContent = `Clicks: ${Math.floor(score)}`;
  clickMultiplierLevelEl.textContent = clickMultiplierLevel;
  clickMultiplierCostEl.textContent = clickMultiplierCost;
  autoClickerLevelEl.textContent = autoClickerLevel;
  autoClickerCostEl.textContent = autoClickerCost;
  buyClickMultiplierBtn.disabled = score < clickMultiplierCost || clickMultiplierLevel >= MAX_LEVEL;
  buyAutoClickerBtn.disabled = score < autoClickerCost || autoClickerLevel >= MAX_LEVEL;
}

bigBall.addEventListener('click', () => {
  score += clicksPerClick;
  totalClicks++;                  
  recentClicks.push(Date.now()); 
  lastClickTime = Date.now();     
  isIdle = false;                 
  isAFK = false;

  updateUI();
  checkAchievements();
});

function showUpgradeToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.classList.add('toast', 'upgrade-toast');
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

function buyClickMultiplier(quantity) {
  if (clickMultiplierLevel >= MAX_LEVEL) return;

  if (quantity === 'max') {
    quantity = 0;
    let cost = clickMultiplierCost;
    let tempLevel = clickMultiplierLevel;

    while (score >= cost && tempLevel < MAX_LEVEL) {
      score -= cost;
      tempLevel++;
      cost = Math.floor(cost * 1.15);
      quantity++;
    } if (quantity === 0) {
  showUpgradeToast("No tenés suficientes puntos para mejorar.");
  return;
}

    clickMultiplierLevel = tempLevel;
    clickMultiplierCost = cost;
  } else {
    for (let i = 0; i < quantity; i++) {
      if (score >= clickMultiplierCost && clickMultiplierLevel < MAX_LEVEL) {
        score -= clickMultiplierCost;
        clickMultiplierLevel++;
        clickMultiplierCost = Math.floor(clickMultiplierCost * 1.15);
      } else {
  if (i === 0) showUpgradeToast("No tenés suficientes puntos para mejorar.");
  break;
}
    }
  }

  clicksPerClick = 1 + clickMultiplierLevel * 0.5;
  totalUpgrades += quantity;
  updateUI();
  checkAchievements();
}

function buyAutoClicker(quantity) {
  if (autoClickerLevel >= MAX_LEVEL) return;

  if (quantity === 'max') {
    quantity = 0;
    let cost = autoClickerCost;
    let tempLevel = autoClickerLevel;

    while (score >= cost && tempLevel < MAX_LEVEL) {
      score -= cost;
      tempLevel++;
      cost = Math.floor(cost * 1.15);
      quantity++;
    } if (quantity === 0) {
  showUpgradeToast("No tenés suficientes puntos para mejorar.");
  return;
}

    autoClickerLevel = tempLevel;
    autoClickerCost = cost;
  } else {
    for (let i = 0; i < quantity; i++) {
      if (score >= autoClickerCost && autoClickerLevel < MAX_LEVEL) {
        score -= autoClickerCost;
        autoClickerLevel++;
        autoClickerCost = Math.floor(autoClickerCost * 1.15);
      } else {
  if (i === 0) showUpgradeToast("No tenés suficientes puntos para mejorar.");
  break;
}
    }
  }

  clicksPerSecond = autoClickerLevel * 0.2;
  totalUpgrades += quantity;
  updateUI();
  checkAchievements();
}
setInterval(() => {
  if (clicksPerSecond > 0) {
    score += clicksPerSecond;
    updateUI();
    checkAchievements();
  }
}, 1000);

startBtn.addEventListener('click', () => {
  menu.classList.add('hidden');
  game.classList.remove('hidden');
  score = 0;
  clickMultiplierLevel = 0;
  autoClickerLevel = 0;
  clickMultiplierCost = 10;
  autoClickerCost = 25;
  clicksPerClick = 1;
  clicksPerSecond = 0;

  updateUI();
});

backBtn.addEventListener('click', () => {
  game.classList.add('hidden');
  menu.classList.remove('hidden');
});

const achievementsBtn = document.getElementById('achievementsBtn');
const achievementsMenu = document.getElementById('achievementsMenu');
const closeAchievementsBtn = document.getElementById('closeAchievementsBtn');
const achievementsList = document.querySelector('.achievements-list');

let achievements = [
  {
    id: 1,
    name: 'Logro 1: 100 clics',
    description: 'Completa 100 clics para desbloquear este logro',
    unlocked: false,
    requirement: 100
  },
  {
    id: 2,
    name: 'Logro 2: 10 mejoras',
    description: 'Compra 10 mejoras para desbloquear este logro',
    unlocked: false,
    requirement: 10
  },
  {
    id: 3,
    name: 'Logro 3: 1000 puntos',
    description: 'Alcanza 1000 puntos para desbloquear este logro',
    unlocked: false,
    requirement: 1000
  },
  {
    id: 4,
    name: 'Logro 4: Clicker Pro',
    description: 'Realiza 1000 clics totales',
    unlocked: false,
    requirement: 1000
  },
  {
    id: 5,
    name: 'Logro 5: Mejorador',
    description: 'Compra 25 mejoras',
    unlocked: false,
    requirement: 25
  },
  {
    id: 6,
    name: 'Logro 6: Multimillonario',
    description: 'Alcanza 1 millón de puntos',
    unlocked: false,
    requirement: 1000000
  },
  {
    id: 7,
    name: 'Logro 7: Frenesí de clics',
    description: 'Haz 50 clics en menos de 10 segundos',
    unlocked: false,
    type: 'speed', // lógica especial
    requirement: 50
  },
  {
    id: 8,
    name: 'Logro 8: Acelerador',
    description: 'Aumenta tu producción automática a 100/s',
    unlocked: false,
    type: 'production',
    requirement: 100
  },
  {
    id: 9,
    name: 'Logro 9: Constructor de imperios',
    description: 'Desbloquea todas las mejoras disponibles',
    unlocked: false,
    type: 'allUpgrades'
  },
  {
    id: 10,
    name: 'Logro 10: Clicker eterno',
    description: 'Juega durante 1 hora acumulada',
    unlocked: false,
    type: 'timePlayed',
    requirement: 3600 // segundos
  },
  {
    id: 11,
    name: 'Logro 11: Soon ...',
    description: 'Soon...',
    unlocked: false,
    type: 'reset'
  },
  {
    id: 12,
    name: 'Logro 12: Jugador silencioso',
    description: 'Juega sin hacer clic durante 5 minutos',
    unlocked: false,
    type: 'idle',
    requirement: 300
  },
  {
    id: 13,
    name: 'Logro 13: ¿Estás ahí?',
    description: 'Dejá el juego abierto sin tocar nada por 10 minutos',
    unlocked: false,
    type: 'afk',
    requirement: 600
  }
];
function loadAchievements() {
  const saved = localStorage.getItem("achievements");
  if (saved) {
    const savedData = JSON.parse(saved);
    achievements = achievements.map(a => {
      const savedAch = savedData.find(s => s.id === a.id);
      return savedAch ? { ...a, unlocked: savedAch.unlocked } : a;
    });
  }
}

function saveAchievements() {
  localStorage.setItem("achievements", JSON.stringify(achievements));
}

function checkAchievements() {
  const now = Date.now();

  achievements.forEach((achievement) => {
    if (achievement.unlocked) return;

    switch (achievement.id) {
      case 1:
        if (totalClicks >= achievement.requirement) unlock(achievement);
        break;
      case 2: 
        if (totalUpgrades >= achievement.requirement) unlock(achievement);
        break;
      case 3:
        if (score >= achievement.requirement) unlock(achievement);
        break;
      case 4:
        if (totalClicks >= achievement.requirement) unlock(achievement);
        break;
      case 5:
        if (totalUpgrades >= achievement.requirement) unlock(achievement);
        break;
      case 6:
        if (score >= achievement.requirement) unlock(achievement);
        break;
      case 7:
        recentClicks = recentClicks.filter(t => now - t < 10000);
        if (recentClicks.length >= achievement.requirement) unlock(achievement);
        break;
      case 8: 
        if (clicksPerSecond >= achievement.requirement) unlock(achievement);
        break;
      case 9: 
        if (clickMultiplierLevel >= MAX_LEVEL && autoClickerLevel >= MAX_LEVEL) unlock(achievement);
        break;
      case 10: 
        if ((now - gameStartTime) / 1000 >= achievement.requirement) unlock(achievement);
        break;
      case 12: 
        if (isIdle && (now - idleStartTime) / 1000 >= achievement.requirement) unlock(achievement);
        break;
      case 13: 
        if (isAFK && (now - afkStartTime) / 1000 >= achievement.requirement) unlock(achievement);
        break;
    }
  });
}

function unlock(achievement) {
  achievement.unlocked = true;

  const reward = Math.floor(achievement.requirement * 0.5 || 100);
  score += reward;

  const element = document.getElementById(`achievement-${achievement.id}`);
  if (element) {
    element.classList.add('unlocked');
    element.querySelector('h3').textContent = `${achievement.name} ✅`;
    element.querySelector('p').textContent = `¡Logro desbloqueado! +${reward.toLocaleString()} puntos`;
  }

  showToast(`🏆 ¡Desbloqueaste el logro: ${achievement.name}! +${reward.toLocaleString()} puntos`);
  updateUI();
  saveAchievements();
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

function updateAchievementsMenu() {
  achievements.forEach(a => {
    const element = document.getElementById(`achievement-${a.id}`);
    if (element && a.unlocked) {
      element.classList.add("bg-green-700", "text-white");
      element.querySelector("h3").textContent = `${a.name} ✅`;
      element.querySelector("p").textContent = "¡Logro desbloqueado!";
    }
  });
}

document.getElementById('debug-btn').addEventListener('click', () => {
  const menu = document.getElementById('debug-menu');
  menu.classList.toggle('hidden');
});

achievementsBtn.addEventListener('click', () => {
  achievementsMenu.classList.remove('hidden');
});

closeAchievementsBtn.addEventListener('click', () => {
  achievementsMenu.classList.add('hidden');
});

setInterval(() => {
  const now = Date.now();

  if (!isIdle && now - lastClickTime > 300000) {
    isIdle = true;
    idleStartTime = now;
  }

  if (!isAFK && now - lastClickTime > 600000) {
    isAFK = true;
    afkStartTime = now;
  }

  checkAchievements();
}, 1000);

window.addEventListener("load", () => {
  loadAchievements();
  updateAchievementsMenu();

  loadGame();

  permanentUpgrades.forEach(u => {
    if (u.bought) applyPermanent(u.id);
  });

  updateUI();
  renderPermanentMenu();
});


let permanentUpgrades = [
  { id: 'double-click', name: 'x2 puntos por clic', desc: 'Duplica los puntos por clic', cost: 10000, bought: false },
  { id: 'double-pps',   name: 'x2 puntos/s',       desc: 'Duplica puntos automáticos', cost: 25000, bought: false },
  { id: 'bonus-1pc',    name: '+1% por mejora',    desc: 'Ganas +1% por cada mejora normal', cost: 50000, bought: false },
  { id: 'auto-save',    name: 'Auto-guardado',     desc: 'Guarda tu progreso cada 30s', cost: 15000, bought: false }
];

let clickBuff = 1;
let ppsBuff   = 1;
let bonusPercent = 0;

function loadPermanent() {
  const saved = localStorage.getItem('permanentUpgrades');
  if (saved) {
    const data = JSON.parse(saved);
    permanentUpgrades = permanentUpgrades.map(u => {
      const s = data.find(x => x.id === u.id);
      return s ? { ...u, bought: s.bought } : u;
    });
  }
}
function savePermanent() {
  localStorage.setItem('permanentUpgrades', JSON.stringify(permanentUpgrades));
}

function renderPermanentMenu() {
  const container = document.getElementById('permanent-list');
  container.innerHTML = '';
  permanentUpgrades.forEach(up => {
    const card = document.createElement('div');
    card.className = 'perm-card';
    card.innerHTML = `
      <h3>${up.name}</h3>
      <p>${up.desc}</p>
      <p>Costo: ${up.cost.toLocaleString()}</p>
      <button ${up.bought|| score<up.cost?'disabled':''} data-id="${up.id}">
        ${up.bought?'Comprado':'Comprar'}
      </button>
    `;
    container.appendChild(card);

    card.querySelector('button').addEventListener('click', () => {
      if (score >= up.cost && !up.bought) {
        score -= up.cost;
        up.bought = true;
        applyPermanent(up.id);
        savePermanent();
        updateUI();
        renderPermanentMenu();
        showToast(`💎 Compraste: ${up.name}`);
      }
    });
  });
}

function applyPermanent(id) {
  switch (id) {
    case 'double-click': clickBuff = 2; break;
    case 'double-pps':   ppsBuff   = 2; break;
    case 'bonus-1pc':    bonusPercent = 1; break;
    case 'auto-save':
      setInterval(() => saveGame(), 30000);
      break;
  }
}

function saveGame() {
  localStorage.setItem('score', score);
  localStorage.setItem('clickMultiplierLevel', clickMultiplierLevel);
  localStorage.setItem('autoClickerLevel', autoClickerLevel);
  localStorage.setItem('clickMultiplierCost', clickMultiplierCost);
  localStorage.setItem('autoClickerCost', autoClickerCost);
  localStorage.setItem('totalClicks', totalClicks);
  localStorage.setItem('totalUpgrades', totalUpgrades);
  localStorage.setItem('gameStartTime', gameStartTime);
  localStorage.setItem('lastClickTime', lastClickTime);
  localStorage.setItem('recentClicks', JSON.stringify(recentClicks));
  localStorage.setItem('idleStartTime', idleStartTime || '');
  localStorage.setItem('afkStartTime', afkStartTime || '');
  localStorage.setItem('isIdle', isIdle);
  localStorage.setItem('isAFK', isAFK);

  savePermanent();
  saveAchievements();
}

function loadGame() {
  score = parseFloat(localStorage.getItem('score')) || 0;
  clickMultiplierLevel = parseInt(localStorage.getItem('clickMultiplierLevel')) || 0;
  autoClickerLevel = parseInt(localStorage.getItem('autoClickerLevel')) || 0;
  clickMultiplierCost = parseInt(localStorage.getItem('clickMultiplierCost')) || 10;
  autoClickerCost = parseInt(localStorage.getItem('autoClickerCost')) || 25;
  totalClicks = parseInt(localStorage.getItem('totalClicks')) || 0;
  totalUpgrades = parseInt(localStorage.getItem('totalUpgrades')) || 0;
  gameStartTime = parseInt(localStorage.getItem('gameStartTime')) || Date.now();
  lastClickTime = parseInt(localStorage.getItem('lastClickTime')) || 0;

  const recentClicksStr = localStorage.getItem('recentClicks');
  recentClicks = recentClicksStr ? JSON.parse(recentClicksStr) : [];

  idleStartTime = localStorage.getItem('idleStartTime') || null;
  afkStartTime = localStorage.getItem('afkStartTime') || null;
  isIdle = localStorage.getItem('isIdle') === 'true';
  isAFK = localStorage.getItem('isAFK') === 'true';

  loadPermanent();
  loadAchievements();

  clicksPerClick = 1 + clickMultiplierLevel * 0.5;
  clicksPerSecond = autoClickerLevel * 0.2;
}

bigBall.replaceWith( (() => {
  const btn = bigBall.cloneNode();
  btn.id = 'bigBall';
  btn.addEventListener('click', () => {
    const gained = clicksPerClick * clickBuff * (1 + bonusPercent/100);
    score += gained;
    totalClicks++;
    recentClicks.push(Date.now());
    lastClickTime = Date.now();
    isIdle = false;
    isAFK = false;
    updateUI(); checkAchievements();
  });
  return btn;
})() );

clearInterval();
setInterval(() => {
  if (clicksPerSecond > 0) {
    const gained = clicksPerSecond * ppsBuff * (1 + bonusPercent/100);
    score += gained;
    updateUI(); checkAchievements();
  }
}, 1000);

document.getElementById('permanentUpgradesBtn').addEventListener('click', () => {
  renderPermanentMenu();
  document.getElementById('permanentUpgradesMenu').classList.remove('hidden');
});
document.getElementById('closePermanentBtn').addEventListener('click', () => {
  document.getElementById('permanentUpgradesMenu').classList.add('hidden');
});

window.addEventListener('load', () => {
  loadPermanent();
  permanentUpgrades.forEach(u => { if (u.bought) applyPermanent(u.id); });


  // const defaultInfoData = {
    // updates: [
      // { title: "Extras", text: "Minor bug fixes, some internal updates", new: true }
    // ],
    // changelogs: [
      // { title: "Changelog #1 (02/08/2025)", text: "Se agregó un botón de Información con changelogs, updates, anuncios, etc.", new: true },
      // { title: "Changelog #2 (03/08/2025)", text: "Se agregó sistema de notificaciones con punto rojo + toast.", new: true },
      // { title: "Changelog #3 (03/08/2025)", text: "Ahora los ítems marcados como 'new' se muestran como 🆕 y desaparecen al abrir el menú.", new: true }
    // ],
    // technical: [],
    // announcements: []
  // };

  // let infoData = JSON.parse(localStorage.getItem("infoData")) || defaultInfoData;
  // let infoSeen = JSON.parse(localStorage.getItem("infoSeen")) || false;

  // const infoToggle = document.getElementById("infoToggle");
  // const infoMenu = document.getElementById("infoMenu");
  // const infoNotif = document.getElementById("infoNotif");
  // const tabContent = document.getElementById("tabContent");

  // infoToggle.addEventListener("click", () => {
    // const wasHidden = infoMenu.classList.contains("hidden");

    // infoMenu.classList.toggle("hidden");

    // if (wasHidden) {
      // switchTab("updates");
      // markInfoAsRead();
      // infoMenu.classList.remove("animate-fade-out");
      // infoMenu.classList.add("animate-fade-in");
    // } else {
      // infoMenu.classList.remove("animate-fade-in");
      // infoMenu.classList.add("animate-fade-out");
      // setTimeout(() => {
        // infoMenu.classList.add("hidden");
      // }, 200);
    // }
  // });

  // function closeInfoMenu() {
    // infoMenu.classList.remove("animate-fade-in");
    // infoMenu.classList.add("animate-fade-out");
    // setTimeout(() => {
      // infoMenu.classList.add("hidden");
    // }, 200);
  // }

  // function switchTab(tab) {
    // tabContent.innerHTML = "";

    // const items = infoData[tab] || [];

    // if (items.length === 0) {
      // const empty = document.createElement("div");
      // empty.classList.add("text-gray-400", "italic");
      // empty.textContent = "Nothing for the moment :)";
      // tabContent.appendChild(empty);
      // return;
    // }

    // items.forEach((item) => {
      // const card = document.createElement("div");
      // card.className = "bg-gray-700 p-3 rounded shadow";
      
      // const title = document.createElement("h4");
      // title.className = "font-bold text-lg mb-1";
      // title.textContent = item.title + (item.new ? " 🆕" : "");
      
      // const text = document.createElement("p");
      // text.textContent = item.text;
      
      // card.appendChild(title);
      // card.appendChild(text);
      // tabContent.appendChild(card);
    // });
  // }

  // function addInfoItem(category, item) {
    // if (!infoData[category]) infoData[category] = [];
    // item.new = true;
    // infoData[category].push(item);

    // localStorage.setItem("infoData", JSON.stringify(infoData));
    // localStorage.setItem("infoSeen", "false");

    // showToast("📢 Nueva información disponible");
    // showInfoNotification();
  // }

  // function showInfoNotification() {
    // infoNotif.classList.remove("hidden");
  // }

  // function hideInfoNotification() {
    // infoNotif.classList.add("hidden");
  // }

  // function markInfoAsRead() {
    // for (let category in infoData) {
      // infoData[category] = infoData[category].map(item => {
        // if (item.new) delete item.new;
        // return item;
      // });
    // }

    // localStorage.setItem("infoData", JSON.stringify(infoData));
    // localStorage.setItem("infoSeen", "true");
    // hideInfoNotification();
  // }

  // const saved = localStorage.getItem("infoData");
  // const seen = localStorage.getItem("infoSeen");

  // if (!saved) {
    // localStorage.setItem("infoData", JSON.stringify(defaultInfoData));
    // localStorage.setItem("infoSeen", "false");
    // showInfoNotification();
    // return;
  // }

  // const data = JSON.parse(saved);

  // let hasNew = false;
  // for (let category in data) {
    // if (data[category].some(item => item.new)) {
      // hasNew = true;
      // break;
    // }
  // }

  // if (seen === "false" || hasNew) {
    // showInfoNotification();
  // }

// var
let totalClicks = parseInt(localStorage.getItem("totalClicks")) || 0;
let clicksLastSecond = 0;
let cps = 0;

document.getElementById("totalClicks").textContent = totalClicks;
document.getElementById("cps").textContent = cps;

document.getElementById("bigBall").addEventListener("click", () => {
    totalClicks++;
    clicksLastSecond++;
    localStorage.setItem("totalClicks", totalClicks);
    document.getElementById("totalClicks").textContent = totalClicks;
});

setInterval(() => {
    cps = clicksLastSecond;
    clicksLastSecond = 0;
    document.getElementById("cps").textContent = cps;
}, 1000);

const chestBtn = document.getElementById('chestBtn');
const chestModal = document.getElementById('chestModal');
const closeChestModalBtn = document.getElementById('closeChestModal');

const chestImgModal = document.getElementById('chestImgModal');
const openChestBtnModal = document.getElementById('openChestBtnModal');
const chestCooldownModal = document.getElementById('chestCooldownModal');

function updateChestUI_Modal() {
  const remaining = getCooldownRemaining();
  if (remaining === 0) {
    chestCooldownModal.textContent = '';
    openChestBtnModal.disabled = false;
    chestImgModal.style.cursor = 'pointer';
    chestImgModal.src = '/assets/closedChest.png';
  } else {
    chestCooldownModal.textContent = `Cooldown: ${remaining}s`;
    openChestBtnModal.disabled = true;
    chestImgModal.style.cursor = 'not-allowed';
    chestImgModal.src = '/assets/closedChest.png';
  }
}

function openChest_Modal() {
  if (getCooldownRemaining() > 0) return;

  setLastChestOpen(Date.now());

  chestImgModal.classList.add('opening');
  openChestBtnModal.disabled = true;
  chestImgModal.style.cursor = 'not-allowed';
  chestImgModal.src = '/assets/openedChest.png';

  setTimeout(() => {
    chestImgModal.classList.remove('opening');
    chestImgModal.src = '/assets/closedChest.png';

    const roll = Math.random() * 100;

    if (roll < 70) {
      const minPoints = 20;
      const maxPoints = 100;
      const rewardPoints = Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints;
      score += rewardPoints;
      totalClicks += rewardPoints;
      showToast(`🎉 You got +${rewardPoints} points!`);
    } else if (roll < 95) {
      const upgrades = [
        { name: 'Click Multiplier', apply: () => buyClickMultiplier(1) },
        { name: 'Auto Clicker', apply: () => buyAutoClicker(1) },
      ];

      const choice = upgrades[Math.floor(Math.random() * upgrades.length)];
      choice.apply();
      showToast(`🎉 You got an upgrade: ${choice.name}!`);
    } else {
      const availablePermanent = permanentUpgrades.filter(up => !up.bought);
      if (availablePermanent.length > 0) {
        const permChoice = availablePermanent[Math.floor(Math.random() * availablePermanent.length)];
        permChoice.bought = true;
        applyPermanent(permChoice.id);
        savePermanent();
        showToast(`🎉 You got a permanent upgrade: ${permChoice.name}!`);
        renderPermanentMenu();
      } else {
        const fallbackPoints = 50;
        score += fallbackPoints;
        totalClicks += fallbackPoints;
        showToast(`🎉 You got +${fallbackPoints} points (no permanents left)!`);
      }
    }

    updateUI();
    updateChestUI_Modal();
  }, 800);
}

chestBtn.addEventListener('click', () => {
  chestModal.classList.remove('hidden');
  updateChestUI_Modal();
});

closeChestModalBtn.addEventListener('click', () => {
  chestModal.classList.add('hidden');
});

openChestBtnModal.addEventListener('click',openChest_Modal);
chestImgModal.addEventListener('click', openChest_Modal);

setInterval(updateChestUI_Modal, 1000);

const CHEST_COOLDOWN_SECONDS = 60;
const CHEST_STORAGE_KEY = 'lastChestOpenTime';

function getLastChestOpen() {
  return parseInt(localStorage.getItem(CHEST_STORAGE_KEY)) || 0;
}

function setLastChestOpen(timestamp) {
  localStorage.setItem(CHEST_STORAGE_KEY, timestamp);
}

function getCooldownRemaining() {
  const lastOpen = getLastChestOpen();
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - lastOpen) / 1000);
  const remaining = CHEST_COOLDOWN_SECONDS - elapsedSeconds;
  return remaining > 0 ? remaining : 0;
}

});
