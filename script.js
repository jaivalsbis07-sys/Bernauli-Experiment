/**
 * Verification of Bernoulli’s Theorem Virtual Laboratory Script
 * Primary source reference: Experiment-4F.pdf
 * 
 * Physical Conduit Dimensions extracted from Experiment-4F.pdf:
 *  - Section h1: Distance = 0.00 m,   d1 = 25.0 mm,  Area = 490.87 × 10^-6 m²
 *  - Section h2: Distance = 0.0603 m, d2 = 13.9 mm,  Area = 151.75 × 10^-6 m²
 *  - Section h3: Distance = 0.0687 m, d3 = 11.8 mm,  Area = 109.36 × 10^-6 m²
 *  - Section h4: Distance = 0.0732 m, d4 = 10.7 mm,  Area = 89.92  × 10^-6 m²
 *  - Section h5: Distance = 0.0811 m, d5 = 10.0 mm,  Area = 78.54  × 10^-6 m² (Throat)
 *  - Section h6: Distance = 0.1415 m, d6 = 25.0 mm,  Area = 490.87 × 10^-6 m² (Outlet)
 *  
 * Acceleration due to gravity used in manual: g = 9.8 m/s² (or standard 9.81 m/s²).
 */

// 1. DATA STRUCTURES EXTRACTED FROM MANUAL
const DUCT_SECTIONS = [
  { id: 'h1', dist: 0.0000, dia: 25.0, area: 490.87, desc: 'Inlet Uniform Duct' },
  { id: 'h2', dist: 0.0603, dia: 13.9, area: 151.75, desc: 'Converging Cone Intermediate' },
  { id: 'h3', dist: 0.0687, dia: 11.8, area: 109.36, desc: 'Converging Cone Tapping 3' },
  { id: 'h4', dist: 0.0732, dia: 10.7, area: 89.92,  desc: 'Entry to Venturi Throat' },
  { id: 'h5', dist: 0.0811, dia: 10.0, area: 78.54,  desc: 'Minimum Cross Section (Throat)' },
  { id: 'h6', dist: 0.1415, dia: 25.0, area: 490.87, desc: 'Divergent Section Outlet' }
];

// Three illustrative experimental observation runs extracted from Experiment-4F.pdf[cite: 1]
const SAMPLE_RUNS = {
  run1: {
    label: 'Run 1 (Qv = 1.09 × 10⁻⁴ m³/s | 6.54 L/min)',
    flowRate: 1.09e-4,
    staticHeads: [190, 179, 165, 150, 137, 152] // in mm Water
  },
  run2: {
    label: 'Run 2 (Qv = 1.658 × 10⁻⁴ m³/s | 9.95 L/min)',
    flowRate: 1.658e-4,
    staticHeads: [210, 194, 175, 153, 135, 157] // in mm Water
  },
  run3: {
    label: 'Run 3 (Qv = 1.90 × 10⁻⁴ m³/s | 11.45 L/min)',
    flowRate: 1.90e-4,
    staticHeads: [230, 208, 185, 155, 132, 162] // in mm Water
  }
};

const GRAVITY = 9.8; // As explicitly written in Experiment-4F.pdf calculation steps (g = 9.8 m/s²)

// Current Table Data State
let activeObservations = JSON.parse(localStorage.getItem('bernoulli_obs_data')) || [
  { flow: '1.09e-4', tube: 'h1', dist: 0.00,   area: 490.87, h_mm: 190 },
  { flow: '1.09e-4', tube: 'h2', dist: 0.0603, area: 151.75, h_mm: 179 },
  { flow: '1.09e-4', tube: 'h3', dist: 0.0687, area: 109.36, h_mm: 165 },
  { flow: '1.09e-4', tube: 'h4', dist: 0.0732, area: 89.92,  h_mm: 150 },
  { flow: '1.09e-4', tube: 'h5', dist: 0.0811, area: 78.54,  h_mm: 137 },
  { flow: '1.09e-4', tube: 'h6', dist: 0.1415, area: 490.87, h_mm: 152 }
];

// Stepper guide steps extracted from Experiment-4F.pdf Procedure
const LAB_PROCEDURE_STEPS = [
  {
    step: 1,
    title: "Initial Valve Alignment",
    instruction: "The flow and bench control valve is opened parallelly for maximum discharge.",
    apparatus: "Flow bench control valve and digital hydraulic bench pump."
  },
  {
    step: 2,
    title: "Observation of Perspex Manometer & Flow",
    instruction: "Note down the water level in the Perspex tube and time for water flow.",
    apparatus: "6 Static Piezometer Perspex Tubes (h₁ to h₆) and bench collection scale."
  },
  {
    step: 3,
    title: "Repeat for Multiple Discharge Rates",
    instruction: "The above procedure is repeated for different discharges by controlling the gate valve and reading are noted down in table.",
    apparatus: "Discharge control gate valve and stopwatch for volumetric tank rise."
  }
];

// Quiz question bank derived directly from Experiment-4F.pdf theory, apparatus, and results
const QUIZ_QUESTIONS = [
  {
    question: "What is the primary aim of Experiment No: 4 as stated in the manual?",
    options: [
      "To calibrate a Venturi flowmeter orifice coefficient",
      "To verify the Bernoulli's theorem for liquids",
      "To calculate the Reynolds number in turbulent pipes",
      "To determine friction factor in rough pipelines"
    ],
    correct: 1,
    marks: 2,
    explanation: "Experiment-4F.pdf states under Aim: 'To verify the Bernoulli's theorem for liquids.'"
  },
  {
    question: "According to the basic concept in the manual, which conditions must the fluid satisfy?",
    options: [
      "Viscous, compressible, and rotational fluid",
      "Ideal, steady, incompressible & irrotational fluid",
      "Non-Newtonian fluid under unsteady fluctuating flow",
      "Turbulent compressible gas through high pressure"
    ],
    correct: 1,
    marks: 2,
    explanation: "The manual explicitly defines: 'for an ideal steady incompressible & irrotational fluid the sum of pressure energy, kinetic energy and potential always constant.'"
  },
  {
    question: "In the manual's formula p/γ + v²/2g + Z, what does γ (gamma) represent for water?",
    options: [
      "Kinematic viscosity = 1.0 × 10⁻⁶ m²/s",
      "Dynamic viscosity = 0.001 Pa·s",
      "Specific weight of water = 9810 N/m³",
      "Standard surface tension = 0.0728 N/m"
    ],
    correct: 2,
    marks: 2,
    explanation: "The manual writes: '(p/γ) = Pressure head at that particular point (for water γ=9810 N/m³)'."
  },
  {
    question: "Which of the following perspex tube tappings represents the minimum cross section (throat)?",
    options: ["Tapping h₁ (25 mm)", "Tapping h₂ (13.9 mm)", "Tapping h₄ (10.7 mm)", "Tapping h₅ (10.0 mm)"],
    correct: 3,
    marks: 2,
    explanation: "At tapping h₅, diameter d₅ = 10.0 mm and area = 78.54 × 10⁻⁶ m², which is the minimum duct area (throat)."
  },
  {
    question: "How is discharge Q calculated in the hydraulics bench as per the manual?",
    options: [
      "Q = (A × H) / t or Volume collected / time",
      "Q = A × sqrt(2gH)",
      "Q = v / (2g × t)",
      "Q = p / (γ × t)"
    ],
    correct: 0,
    marks: 2,
    explanation: "The manual gives: Q = (A × H)/t, where A is collecting tank area, H is rise in tank, and t is collection time."
  },
  {
    question: "As liquid flows through the converging section into the throat (h₅), what occurs to velocity and static pressure?",
    options: [
      "Velocity decreases and static pressure increases",
      "Velocity increases and static pressure decreases",
      "Both velocity and static pressure increase equally",
      "Both velocity and static pressure drop to zero"
    ],
    correct: 1,
    marks: 2,
    explanation: "As stated in the Inference: 'As the flow passes through the venturi reduced cross-section, the velocity increases and the static pressure decreases.'"
  },
  {
    question: "What value of gravitational acceleration g is used in the model dynamic head calculation in the manual?",
    options: ["9.8 m/s²", "10.5 m/s²", "8.9 m/s²", "32.2 m/s²"],
    correct: 0,
    marks: 2,
    explanation: "The manual explicitly writes: 'Dynamic head (g = 9.8 m/s²)' in its model calculation section."
  },
  {
    question: "In the manual's reported Result section, what was the total head value at the throat for lower flow rate?",
    options: ["0.140 m", "0.180 m", "0.216 m", "0.250 m"],
    correct: 1,
    marks: 2,
    explanation: "Manual Result: 'Total head value for lower flow rate = 0.180 m' (and 0.216 m for higher flow rate)."
  },
  {
    question: "Why does the total head slightly decline in the diverging diffuser section towards h₆?",
    options: [
      "Due to non-conservation of mass",
      "Due to pipe frictional losses and experimental errors",
      "Due to sudden cooling of the water",
      "Because atmospheric pressure drops"
    ],
    correct: 1,
    marks: 2,
    explanation: "The manual specifies: 'The variation in h are due to frictional losses and experimental errors.'"
  },
  {
    question: "Which apparatus item is NOT part of the apparatus list in Experiment-4F.pdf?",
    options: [
      "Bernoulli's apparatus",
      "Digital Hydraulic Bench",
      "Stop watch",
      "Laser Doppler Velocimeter"
    ],
    correct: 3,
    marks: 2,
    explanation: "The apparatus list in the PDF contains strictly: 1. Bernoulli's apparatus, 2. Digital Hydraulic Bench, 3. Stop watch."
  }
];

/* ==========================================================================
   2. INITIALIZATION & DOM BINDINGS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initSimulation();
  renderObservationTable();
  initChart();
  initTheoryInteractions();
  initApparatusHotspots();
  initProcedureStepper();
  initQuiz();
  initNavControls();
  initCalculator();
});

/* ==========================================================================
   3. HERO BACKGROUND CANVAS (Water Flow Particles)
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('heroFlowCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 45;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 1.5 + 0.8,
      opacity: Math.random() * 0.4 + 0.1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.2;

    particles.forEach(p => {
      ctx.beginPath();
      ctx.globalAlpha = p.opacity;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.length, p.y);
      ctx.stroke();

      p.x += p.speed;
      if (p.x > width) {
        p.x = -p.length;
        p.y = Math.random() * height;
      }
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ==========================================================================
   4. THEORY EQUATION INTERACTION & ENERGY BALANCE
   ========================================================================== */
function initTheoryInteractions() {
  const terms = {
    'p-head': {
      title: "Pressure Head (p / γ)",
      symbol: "p/γ",
      unit: "m of liquid (or mm Water)",
      desc: "Represents the static energy head per unit weight of fluid. In the manual, γ = 9810 N/m³ for water. Measured directly via the vertical perspex manometer heights."
    },
    'v-head': {
      title: "Velocity / Dynamic Head (v² / 2g)",
      symbol: "v²/2g",
      unit: "m of liquid",
      desc: "Represents the kinetic energy per unit weight of moving liquid. Evaluated from velocity v = Q / a with g = 9.8 m/s²."
    },
    'z-head': {
      title: "Datum / Elevation Head (Z)",
      symbol: "Z",
      unit: "m",
      desc: "Potential energy head determined with respect to a horizontal reference line. In this experiment, the duct axis is horizontal, so Z is constant along all measuring points."
    },
    'total-head': {
      title: "Total Head (Total Energy)",
      symbol: "H = p/γ + v²/2g + Z",
      unit: "m of water",
      desc: "According to Bernoulli's Theorem, for steady irrotational incompressible flow without friction, Total Head remains constant throughout the conduit."
    }
  };

  document.querySelectorAll('.eq-term').forEach(el => {
    el.addEventListener('click', () => {
      const termKey = el.dataset.term;
      const data = terms[termKey];
      if (!data) return;

      document.getElementById('termDetailTitle').textContent = data.title;
      document.getElementById('termDetailDesc').textContent = data.desc;
      document.getElementById('termDetailUnit').textContent = `Unit: ${data.unit}`;
      document.getElementById('termDetailSymbol').textContent = `Symbol: ${data.symbol}`;
    });
  });

  // Interactive slider inside Theory section
  const slider = document.getElementById('theoryConstrictionSlider');
  const label = document.getElementById('constrictionLabel');
  const barP = document.getElementById('barPHead');
  const barV = document.getElementById('barVHead');
  const pVal = document.getElementById('theoryPHeadVal');
  const vVal = document.getElementById('theoryVHeadVal');
  const totVal = document.getElementById('theoryTotalHeadVal');

  const presets = [
    { name: 'Inlet (h₁)', pHead: 0.190, vHead: 0.003, tot: 0.193 },
    { name: 'Converging (h₂)', pHead: 0.179, vHead: 0.012, tot: 0.191 },
    { name: 'Converging (h₃)', pHead: 0.165, vHead: 0.024, tot: 0.189 },
    { name: 'Throat Entry (h₄)', pHead: 0.150, vHead: 0.038, tot: 0.188 },
    { name: 'Throat Minimum (h₅)', pHead: 0.137, vHead: 0.043, tot: 0.180 }
  ];

  if (slider) {
    slider.addEventListener('input', (e) => {
      const idx = parseInt(e.target.value) - 1;
      const data = presets[idx];
      label.textContent = data.name;
      
      const pPercent = (data.pHead / data.tot) * 100;
      const vPercent = 100 - pPercent;
      
      barP.style.width = `${pPercent}%`;
      barV.style.width = `${vPercent}%`;
      
      pVal.textContent = `${data.pHead.toFixed(3)} m`;
      vVal.textContent = `${data.vHead.toFixed(3)} m`;
      totVal.textContent = `${data.tot.toFixed(3)} m`;
    });
  }
}

/* ==========================================================================
   5. INTERACTIVE APPARATUS SVG HOTSPOTS
   ========================================================================== */
function initApparatusHotspots() {
  const hotspotTitle = document.getElementById('hotspotTitle');
  const hotspotDesc = document.getElementById('hotspotDesc');
  const hotspotArea = document.getElementById('hotspotArea');
  const hotspotDist = document.getElementById('hotspotDist');

  document.querySelectorAll('.manometer-col').forEach(col => {
    col.addEventListener('click', () => {
      const index = parseInt(col.dataset.index) - 1;
      const data = DUCT_SECTIONS[index];

      hotspotTitle.textContent = `Static Tapping Point ${data.id.toUpperCase()}`;
      hotspotDesc.textContent = `${data.desc} of the Bernoulli apparatus. Diameter = ${data.dia} mm.`;
      hotspotArea.textContent = `Area: ${data.area} × 10⁻⁶ m²`;
      hotspotDist.textContent = `Distance: ${data.dist.toFixed(4)} m from datum`;
    });
  });

  const valve = document.getElementById('hotspotValve');
  if (valve) {
    valve.addEventListener('click', () => {
      hotspotTitle.textContent = "Discharge Bench Gate Valve";
      hotspotDesc.textContent = "Regulates water flow rate Qv through the conduit into the volumetric measuring tank.";
      hotspotArea.textContent = "Type: Gate / Control Valve";
      hotspotDist.textContent = "Location: Apparatus Outlet";
    });
  }

  // Toggle label visibility
  const toggleBtn = document.getElementById('toggleLabelsBtn');
  if (toggleBtn) {
    let visible = true;
    toggleBtn.addEventListener('click', () => {
      visible = !visible;
      document.querySelectorAll('.man-label').forEach(el => {
        el.style.display = visible ? 'block' : 'none';
      });
      toggleBtn.textContent = visible ? "Hide Tapping Labels" : "Show Tapping Labels";
    });
  }
}

/* ==========================================================================
   6. STEP-BY-STEP PROCEDURE STEPPER
   ========================================================================== */
function initProcedureStepper() {
  let currentStep = 0;
  const heading = document.getElementById('stepHeading');
  const instr = document.getElementById('stepInstruction');
  const comp = document.getElementById('stepActiveComponent');
  const badge = document.getElementById('stepCounterBadge');
  const fill = document.getElementById('stepperProgressFill');
  const prevBtn = document.getElementById('prevStepBtn');
  const nextBtn = document.getElementById('nextStepBtn');
  const resetBtn = document.getElementById('resetStepBtn');

  function renderStep(idx) {
    const data = LAB_PROCEDURE_STEPS[idx];
    heading.textContent = `Step ${data.step}: ${data.title}`;
    instr.textContent = `"${data.instruction}"`;
    comp.textContent = data.apparatus;
    badge.textContent = `Step ${idx + 1} of ${LAB_PROCEDURE_STEPS.length}`;
    fill.style.width = `${((idx + 1) / LAB_PROCEDURE_STEPS.length) * 100}%`;

    prevBtn.disabled = (idx === 0);
    nextBtn.disabled = (idx === LAB_PROCEDURE_STEPS.length - 1);
  }

  nextBtn.addEventListener('click', () => {
    if (currentStep < LAB_PROCEDURE_STEPS.length - 1) {
      currentStep++;
      renderStep(currentStep);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      renderStep(currentStep);
    }
  });

  resetBtn.addEventListener('click', () => {
    currentStep = 0;
    renderStep(currentStep);
  });

  renderStep(0);
}

/* ==========================================================================
   7. REALTIME FLUID CONDUIT SIMULATION (Canvas + Manometer Heights)
   ========================================================================== */
let simAnimationId;
let isSimPlaying = true;
let currentFlowRate = 1.09e-4; // Default Run 1 flow rate (m³/s)

function initSimulation() {
  const canvas = document.getElementById('simCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const flowSlider = document.getElementById('flowSlider');
  const flowValBadge = document.getElementById('flowValBadge');

  // Particles inside simulation
  const numParticles = 60;
  let particles = [];

  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      relY: Math.random(), // 0 to 1 across local height
      size: Math.random() * 2.5 + 1.5
    });
  }

  // Geometry definition of conduit along x: 0 to 900
  // Inlet (x=0 to 200, halfHeight=40), Throat (x=500, halfHeight=16), Outlet (x=900, halfHeight=40)
  function getConduitHalfHeight(x) {
    if (x <= 200) return 42;
    if (x <= 550) {
      // Converging
      const t = (x - 200) / 350;
      return 42 - t * (42 - 16);
    }
    // Diverging
    const t = (x - 550) / 350;
    return 16 + t * (42 - 16);
  }

  function renderSimMetrics() {
    const tbody = document.getElementById('simMetricsTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    DUCT_SECTIONS.forEach((sec, i) => {
      const areaM2 = sec.area * 1e-6;
      const v = currentFlowRate / areaM2;
      const dynHead = (v * v) / (2 * GRAVITY);
      
      // Interpolate pressure drop from inlet
      const baseH = 0.200; // 200 mm base water
      const staticHeadM = Math.max(0.05, baseH - (dynHead * 0.85));
      const totalHeadM = staticHeadM + dynHead;

      // Update SVG manometer lines
      const waterLine = document.getElementById(`manWater${i + 1}`);
      if (waterLine) {
        // SVG y goes from 270 (bottom) up to 50 (top)
        const yTop = Math.max(50, 270 - (staticHeadM * 800));
        waterLine.setAttribute('y1', yTop);
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${sec.id}</strong></td>
        <td>${sec.dist.toFixed(4)}</td>
        <td>${sec.area.toFixed(2)}</td>
        <td>${v.toFixed(3)}</td>
        <td>${staticHeadM.toFixed(3)}</td>
        <td>${dynHead.toFixed(4)}</td>
        <td><strong>${totalHeadM.toFixed(3)}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function simLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const midY = canvas.height / 2;

    // Draw Conduit Perspex Walls
    ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    // Top boundary
    for (let x = 0; x <= canvas.width; x += 10) {
      const hh = getConduitHalfHeight(x);
      if (x === 0) ctx.moveTo(x, midY - hh);
      else ctx.lineTo(x, midY - hh);
    }
    // Bottom boundary
    for (let x = canvas.width; x >= 0; x -= 10) {
      const hh = getConduitHalfHeight(x);
      ctx.lineTo(x, midY + hh);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw Particles with velocity proportional to 1 / halfHeight
    particles.forEach(p => {
      const hh = getConduitHalfHeight(p.x);
      const y = midY - hh + p.relY * (2 * hh);

      // Local velocity: narrow section has higher speed
      const localSpeed = (42 / hh) * (currentFlowRate / 1.09e-4) * 2.2;

      ctx.beginPath();
      ctx.fillStyle = '#00f0ff';
      ctx.arc(p.x, y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (isSimPlaying) {
        p.x += localSpeed;
        if (p.x > canvas.width) {
          p.x = 0;
          p.relY = Math.random();
        }
      }
    });

    simAnimationId = requestAnimationFrame(simLoop);
  }

  // Slider event
  flowSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    currentFlowRate = val * 1e-4;
    const lpm = (val * 6).toFixed(2);
    flowValBadge.textContent = `${val.toFixed(2)} × 10⁻⁴ m³/s (${lpm} L/min)`;
    renderSimMetrics();
  });

  document.getElementById('simPlayBtn').addEventListener('click', () => { isSimPlaying = true; });
  document.getElementById('simPauseBtn').addEventListener('click', () => { isSimPlaying = false; });
  document.getElementById('simResetBtn').addEventListener('click', () => {
    flowSlider.value = 1.09;
    currentFlowRate = 1.09e-4;
    flowValBadge.textContent = `1.09 × 10⁻⁴ m³/s (6.54 L/min)`;
    renderSimMetrics();
  });

  renderSimMetrics();
  simLoop();
}

/* ==========================================================================
   8. OBSERVATION TABLE & LOCAL STORAGE MANAGEMENT
   ========================================================================== */
function renderObservationTable() {
  const tbody = document.getElementById('obsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  activeObservations.forEach((row, index) => {
    const flowVal = parseFloat(row.flow);
    const areaM2 = row.area * 1e-6;
    const v = flowVal / areaM2;
    const dynHead = (v * v) / (2 * GRAVITY);
    const staticHeadM = row.h_mm / 1000.0;
    const totalHeadM = staticHeadM + dynHead;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${(flowVal * 1e4).toFixed(2)} × 10⁻⁴</td>
      <td><strong>${row.tube}</strong></td>
      <td>${row.dist.toFixed(4)}</td>
      <td>${row.area.toFixed(2)}</td>
      <td>
        <input type="number" class="editable-cell" data-idx="${index}" value="${row.h_mm}" style="width: 80px;">
      </td>
      <td>${v.toFixed(3)}</td>
      <td>${dynHead.toFixed(4)}</td>
      <td><strong style="color:var(--cyan-light);">${totalHeadM.toFixed(3)}</strong></td>
    `;
    tbody.appendChild(tr);
  });

  // Attach change listener to editable static head inputs
  document.querySelectorAll('.editable-cell').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        activeObservations[idx].h_mm = val;
        localStorage.setItem('bernoulli_obs_data', JSON.stringify(activeObservations));
        renderObservationTable();
        updateChartData();
      }
    });
  });
}

// Sample Run Loaders
document.getElementById('loadSampleRun1Btn').addEventListener('click', () => loadSampleRun('run1'));
document.getElementById('loadSampleRun2Btn').addEventListener('click', () => loadSampleRun('run2'));
document.getElementById('loadSampleRun3Btn').addEventListener('click', () => loadSampleRun('run3'));

function loadSampleRun(key) {
  const run = SAMPLE_RUNS[key];
  if (!run) return;

  activeObservations = DUCT_SECTIONS.map((sec, i) => ({
    flow: run.flowRate.toString(),
    tube: sec.id,
    dist: sec.dist,
    area: sec.area,
    h_mm: run.staticHeads[i]
  }));

  localStorage.setItem('bernoulli_obs_data', JSON.stringify(activeObservations));
  renderObservationTable();
  updateChartData();
}

// Clear and Download CSV
document.getElementById('clearTableBtn').addEventListener('click', () => {
  if (confirm("Reset table values to default Run 1 data?")) {
    loadSampleRun('run1');
  }
});

document.getElementById('exportCsvBtn').addEventListener('click', () => {
  let csv = "Flow_Rate(m3/s),Static_Tube,Distance_into_Duct(m),Area(m2),Static_Head(mm),Velocity(m/s),Dynamic_Head(m),Total_Head(m)\n";
  activeObservations.forEach(r => {
    const q = parseFloat(r.flow);
    const a = r.area * 1e-6;
    const v = q / a;
    const dh = (v * v) / (2 * GRAVITY);
    const th = (r.h_mm / 1000) + dh;
    csv += `${q},${r.tube},${r.dist},${a},${r.h_mm},${v.toFixed(3)},${dh.toFixed(4)},${th.toFixed(4)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'Bernoulli_Experiment_4F_Observations.csv');
  a.click();
});

/* ==========================================================================
   9. INTERACTIVE LIVE CALCULATOR
   ========================================================================== */
function initCalculator() {
  const computeBtn = document.getElementById('calcComputeBtn');
  const sampleBtn = document.getElementById('calcSampleBtn');
  const outputBox = document.getElementById('calcStepsDetails');

  sampleBtn.addEventListener('click', () => {
    document.getElementById('calcVol').value = "6.54";
    document.getElementById('calcTime').value = "60";
    document.getElementById('calcDia').value = "10.0";
    document.getElementById('calcStaticHead').value = "137";
  });

  computeBtn.addEventListener('click', () => {
    const volL = parseFloat(document.getElementById('calcVol').value);
    const timeS = parseFloat(document.getElementById('calcTime').value);
    const diaMm = parseFloat(document.getElementById('calcDia').value);
    const staticHmm = parseFloat(document.getElementById('calcStaticHead').value);

    if (isNaN(volL) || isNaN(timeS) || isNaN(diaMm) || isNaN(staticHmm) || timeS <= 0 || diaMm <= 0) {
      outputBox.innerHTML = `<span style="color:var(--accent-red);">Please enter valid positive values for all parameters.</span>`;
      return;
    }

    // Calculations based on manual formulas:
    const volM3 = volL / 1000.0;
    const Q = volM3 / timeS;
    const diaM = diaMm / 1000.0;
    const areaM2 = (Math.PI / 4) * Math.pow(diaM, 2);
    const vel = Q / areaM2;
    const dynHead = Math.pow(vel, 2) / (2 * GRAVITY);
    const staticHeadM = staticHmm / 1000.0;
    const totalHeadM = staticHeadM + dynHead;

    outputBox.innerHTML = `
      <div style="line-height:1.8;">
        <strong>1. Flow Rate (Q):</strong><br>
        <code>Q = V / t = (${volL} × 10⁻³ m³) / ${timeS} s = <strong>${Q.toExponential(4)} m³/s</strong></code><br>
        <strong>2. Cross-Sectional Area (a):</strong><br>
        <code>a = (π / 4) × d² = (π / 4) × (${diaM} m)² = <strong>${(areaM2 * 1e6).toFixed(2)} × 10⁻⁶ m²</strong></code><br>
        <strong>3. Fluid Velocity (V):</strong><br>
        <code>V = Q / a = (${Q.toExponential(3)}) / (${areaM2.toExponential(3)}) = <strong>${vel.toFixed(3)} m/s</strong></code><br>
        <strong>4. Dynamic Head (v² / 2g with g = ${GRAVITY} m/s²):</strong><br>
        <code>h<sub>d</sub> = (${vel.toFixed(3)})² / (2 × ${GRAVITY}) = <strong>${dynHead.toFixed(4)} m</strong></code><br>
        <strong>5. Total Head (H):</strong><br>
        <code>H = Static Head + Dynamic Head = ${staticHeadM.toFixed(3)} m + ${dynHead.toFixed(4)} m = <strong style="color:var(--cyan-light);">${totalHeadM.toFixed(4)} m</strong></code>
      </div>
    `;
  });
}

/* ==========================================================================
   10. CHART.JS INTERACTIVE HYDRAULIC GRADIENT GRAPH
   ========================================================================== */
let chartInstance = null;

function initChart() {
  const ctx = document.getElementById('bernoulliChart').getContext('2d');
  const labels = DUCT_SECTIONS.map(s => `${s.id} (${s.dist.toFixed(3)}m)`);

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Head H (m)',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#ffffff',
          backgroundColor: '#ffffff',
          borderWidth: 3,
          tension: 0.2,
          pointRadius: 5
        },
        {
          label: 'Static Head h = p/γ (m)',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.2)',
          borderWidth: 2,
          tension: 0.2,
          fill: true,
          pointRadius: 4
        },
        {
          label: 'Dynamic Head hd = v²/2g (m)',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          borderWidth: 2,
          tension: 0.2,
          fill: true,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Static Tube & Distance into Duct (m)', color: '#94a3b8' },
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#e2e8f0' }
        },
        y: {
          title: { display: true, text: 'Energy Head (m of water)', color: '#94a3b8' },
          grid: { color: 'rgba(51, 65, 85, 0.3)' },
          ticks: { color: '#e2e8f0' },
          min: 0
        }
      },
      plugins: {
        legend: {
          labels: { color: '#e2e8f0' }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(4)} m`;
            }
          }
        }
      }
    }
  });

  updateChartData();

  // Dynamic head toggle
  let showDynamic = true;
  document.getElementById('toggleDynamicHeadBtn').addEventListener('click', () => {
    showDynamic = !showDynamic;
    chartInstance.data.datasets[2].hidden = !showDynamic;
    chartInstance.update();
  });

  document.getElementById('refreshGraphBtn').addEventListener('click', updateChartData);
}

function updateChartData() {
  if (!chartInstance) return;

  const staticHeads = [];
  const dynamicHeads = [];
  const totalHeads = [];

  activeObservations.forEach(row => {
    const q = parseFloat(row.flow);
    const a = row.area * 1e-6;
    const v = q / a;
    const dh = (v * v) / (2 * GRAVITY);
    const sh = row.h_mm / 1000.0;
    const th = sh + dh;

    staticHeads.push(sh);
    dynamicHeads.push(dh);
    totalHeads.push(th);
  });

  chartInstance.data.datasets[0].data = totalHeads;
  chartInstance.data.datasets[1].data = staticHeads;
  chartInstance.data.datasets[2].data = dynamicHeads;
  chartInstance.update();

  // Evaluate verification tolerance
  const maxHead = Math.max(...totalHeads);
  const minHead = Math.min(...totalHeads);
  const spread = maxHead - minHead;
  const verdictText = document.getElementById('graphVerdictText');

  if (spread < 0.045) {
    verdictText.textContent = "Bernoulli’s theorem is verified within laboratory tolerance. Total head remains approximately constant across convergent and throat tappings.";
  } else {
    verdictText.textContent = "Significant total head deviation detected. Review readings, units, flow stability, and experimental losses in divergent section.";
  }
}

/* ==========================================================================
   11. INTERACTIVE QUIZ MODULE (Scored out of 20 Marks)
   ========================================================================== */
function initQuiz() {
  let currentIdx = 0;
  let totalScore = parseInt(localStorage.getItem('bernoulli_quiz_score')) || 0;
  const qNum = document.getElementById('currentQNum');
  const qTotal = document.getElementById('totalQCount');
  const scoreBadge = document.getElementById('quizScore');
  const qText = document.getElementById('quizQuestionText');
  const optContainer = document.getElementById('quizOptionsContainer');
  const expBox = document.getElementById('quizExplanationBox');
  const expText = document.getElementById('explanationText');
  const nextBtn = document.getElementById('quizNextBtn');
  const restartBtn = document.getElementById('quizRestartBtn');
  const progressBar = document.getElementById('quizProgressBar');

  qTotal.textContent = QUIZ_QUESTIONS.length;
  scoreBadge.textContent = totalScore;

  function loadQuestion(idx) {
    expBox.classList.add('hidden');
    nextBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    optContainer.innerHTML = '';

    const q = QUIZ_QUESTIONS[idx];
    qNum.textContent = idx + 1;
    qText.textContent = q.question;
    progressBar.style.width = `${((idx + 1) / QUIZ_QUESTIONS.length) * 100}%`;

    q.options.forEach((opt, oIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleOptionSelect(oIdx, q, btn));
      optContainer.appendChild(btn);
    });
  }

  function handleOptionSelect(selectedIdx, questionData, selectedBtn) {
    const allButtons = optContainer.querySelectorAll('.quiz-option-btn');
    allButtons.forEach(b => b.disabled = true);

    if (selectedIdx === questionData.correct) {
      selectedBtn.classList.add('correct');
      totalScore += questionData.marks;
      scoreBadge.textContent = totalScore;
      localStorage.setItem('bernoulli_quiz_score', totalScore);
    } else {
      selectedBtn.classList.add('wrong');
      allButtons[questionData.correct].classList.add('correct');
    }

    expText.textContent = questionData.explanation;
    expBox.classList.remove('hidden');

    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      nextBtn.style.display = 'inline-block';
    } else {
      restartBtn.style.display = 'inline-block';
      nextBtn.style.display = 'none';
    }
  }

  nextBtn.addEventListener('click', () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      currentIdx++;
      loadQuestion(currentIdx);
    }
  });

  restartBtn.addEventListener('click', () => {
    currentIdx = 0;
    totalScore = 0;
    scoreBadge.textContent = 0;
    localStorage.removeItem('bernoulli_quiz_score');
    loadQuestion(0);
  });

  loadQuestion(0);
}

/* ==========================================================================
   12. NAVIGATION, THEME & REPORT PRINT CONTROLS
   ========================================================================== */
function initNavControls() {
  // Theme Toggle
  const themeBtn = document.getElementById('themeToggleBtn');
  themeBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = (currentTheme === 'light') ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
  });

  // Reduced Motion Toggle
  const motionBtn = document.getElementById('motionToggleBtn');
  motionBtn.addEventListener('click', () => {
    document.body.classList.toggle('reduced-motion');
    alert(document.body.classList.contains('reduced-motion') ? "Reduced motion enabled." : "Standard animations enabled.");
  });

  // Full Screen Lab Mode
  const fsBtn = document.getElementById('fullscreenBtn');
  fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Mobile Hamburger Menu
  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });

  document.querySelectorAll('.nav-menu a').forEach(a => {
    a.addEventListener('click', () => navMenu.classList.remove('show'));
  });

  // Print Report Button
  document.getElementById('printReportBtn').addEventListener('click', () => {
    window.print();
  });

  // Reset All Stored Lab Data
  document.getElementById('resetAllDataBtn').addEventListener('click', () => {
    if (confirm("Reset all stored laboratory observations and quiz scores to original defaults?")) {
      localStorage.clear();
      location.reload();
    }
  });
}