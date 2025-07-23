// percy.js — Recursive Logic Engine with LLM + Progressive Learning + SMS + Goal Planning + Meta Mutation + GitHub Sync + Dictionary + Vercel Proxy

const coreNodeList = [
  "G001", "G002", "G003", "G004", "G005", "G080",
  "G081", "G082", "G083", "G084", "G085", "G086", "G087", "G088", "G089", "G090",
  "G091", "G092", "G093", "G094", "G095", "G096", "G097", "G098", "G099", "G100",
  "G101", "G102", "G103", "G104", "G105", "G106", "G107", "G108", "G109", "G110",
  "G111", "G112", "G113", "G114", "G115", "G116", "G117", "G118", "G119", "G120",
  "G121", "G122", "G123", "G124", "G125", "G126", "G127", "G128", "G129", "G130",
  "G131", "G132", "G133", "G134", "G135", "G136", "G137", "G138", "G139", "G140",
  "G141", "G142", "G143", "G144", "G145", "G146", "G147", "G148", "G149", "G150",
  "G151", "G152", "G153", "G154", "G155", "G156", "G157", "G158", "G159", "G160",
  "G161", "G162", "G163", "G164", "G165", "G166", "G167", "G168", "G169", "G170",
  "G171", "G172", "G173", "G174", "G175", "G176", "G177", "G178", "G179", "G180",
  "G181", "G182", "G183", "G184", "G185", "G186", "G187", "G188", "G189", "G190",
  "G191", "G192", "G193", "G194", "G195", "G196", "G197", "G198", "G199", "G200",
  "G201", "G202", "G203", "G204", "G205", "G206", "G207", "G208", "G209", "G210",
  "G211", "G212", "G213", "G214", "G215", "G216", "G217", "G218", "G219", "G220",
  "G221", "G222", "G223", "G224", "G225", "G226", "G227", "G228", "G229", "G230",
  "G231", "G232", "G233", "G234", "G235", "G236", "G237", "G238", "G239", "G240",
  "G241", "G242", "G243", "G244", "G245", "G246", "G247", "G248", "G249", "G250",
  "G251", "G252", "G253", "G254", "G255", "G256", "G257", "G258", "G259", "G260",
  "G261", "G262", "G263", "G264", "G265", "G266", "G267", "G268", "G269", "G270",
  "G271", "G272", "G273", "G274", "G275", "G276", "G277", "G278", "G279", "G280",
  "G281", "G282", "G283", "G284", "G285", "G286", "G287", "G288", "G289", "G290",
  "G291", "G292", "G293", "G294", "G295", "G296", "G297", "G298", "G299", "G300",
  "G301", "G302", "G303", "G304", "G305", "G306", "G307", "G308", "G309", "G310",
  "G311", "G312", "G313", "G314", "G315", "G316", "G317", "G318", "G319", "G320",
  "G321", "G322", "G323", "G324", "G325", "G326", "G327", "G328", "G329", "G330",
  "G331", "G332", "G333", "G334", "G335", "G336", "G337", "G338", "G339", "G340",
  "G341", "G342", "G343", "G344", "G345", "G346", "G347", "G348", "G349", "G350",
  "G351", "G352", "G353", "G354", "G355", "G356", "G357", "G358", "G359", "G360",
  "G361", "G362", "G363", "G364", "G365", "G366", "G367", "G368", "G369", "G370",
  "G371", "G372", "G373", "G374", "G375", "G376", "G377", "G378", "G379", "G380",
  "G381", "G382", "G383", "G384", "G385", "G386", "G387", "G388", "G389", "G390",
  "G391", "G392", "G393", "G394", "G395", "G396", "G397", "G398", "G399", "G400",
  "G401", "G402", "G403", "G404", "G405", "G406", "G407", "G408", "G409", "G410",
  "G411", "G412", "G413", "G414", "G415", "G416", "G417", "G418", "G419", "G420",
  "G421", "G422", "G423", "G424", "G425", "G426", "G427", "G428", "G429", "G430",
  "G431", "G432", "G433", "G434", "G435", "G436", "G437", "G438", "G439", "G440",
  "G441", "G442", "G443", "G444", "G445", "G446", "G447", "G448", "G449", "G450",
  "G451", "G452", "G453", "G454", "G455", "G456", "G457", "G458", "G459", "G460",
  "G461", "G462", "G463", "G464", "G465", "G466", "G467", "G468", "G469", "G470",
  "G471", "G472", "G473", "G474", "G475", "G476", "G477", "G478", "G479", "G480",
  "G481", "G482", "G483", "G484", "G485", "G486", "G487", "G488", "G489", "G490",
  "G491", "G492", "G493", "G494", "G495", "G496", "G497", "G498", "G499", "G500",
  "G501", "G502", "G503", "G504", "G505", "G506", "G507", "G508", "G509", "G510",
  "G511", "G512", "G513", "G514", "G515", "G516", "G517", "G518", "G519", "G520",
  "G521", "G522", "G523", "G524", "G525", "G526", "G527", "G528", "G529", "G530",
  "G531", "G532", "G533", "G534", "G535", "G536", "G537", "G538", "G539", "G540",
  "G541", "G542", "G543", "G544", "G545", "G546", "G547", "G548", "G549", "G550",
  "G551", "G552", "G553", "G554", "G555", "G556", "G557", "G558", "G559", "G560",
  "G561", "G562", "G563", "G564", "G565", "G566", "G567", "G568", "G569", "G570",
  "G571", "G572", "G573", "G574", "G575", "G576", "G577", "G578", "G579", "G580",
  "G581", "G582", "G583", "G584", "G585", "G586", "G587", "G588", "G589", "G590",
  "G591", "G592", "G593", "G594", "G595", "G596", "G597", "G598", "G599", "G600",
  "G601", "G602", "G603", "G604", "G605", "G606", "G607", "G608", "G609", "G610",
  "G611", "G612", "G613", "G614", "G615", "G616", "G617", "G618", "G619", "G620",
  "G621", "G622", "G623", "G624", "G625", "G626", "G627", "G628", "G629", "G630",
  "G631", "G632", "G633", "G634", "G635", "G636", "G637", "G638", "G639", "G640",
  "G641", "G642", "G643", "G644", "G645", "G646", "G647", "G648", "G649", "G650",
  "G651", "G652", "G653", "G654", "G655", "G656", "G657", "G658", "G659", "G660",
  "G661", "G662", "G663", "G664", "G665", "G666", "G667", "G668", "G669", "G670",
  "G671", "G672", "G673", "G674", "G675", "G676", "G677", "G678", "G679", "G680",
  "G681", "G682", "G683", "G684", "G685", "G686", "G687", "G688", "G689", "G690",
  "G691", "G692", "G693", "G694", "G695", "G696", "G697", "G698", "G699", "G700",
  "G701", "G702", "G703", "G704", "G705", "G706", "G707", "G708", "G709", "G710",
  "G711", "G712", "G713", "G714", "G715", "G716", "G717", "G718", "G719", "G720",
  "G721", "G722", "G723", "G724", "G725", "G726", "G727", "G728", "G729", "G730",
  "G731", "G732", "G733", "G734", "G735", "G736", "G737", "G738", "G739", "G740",
  "G741", "G742", "G743", "G744", "G745", "G746", "G747", "G748", "G749", "G750",
  "G751", "G752", "G753", "G754", "G755", "G756", "G757", "G758", "G759", "G760",
  "G761", "G762", "G763", "G764", "G765", "G766", "G767", "G768", "G769", "G770",
  "G771", "G772", "G773", "G774", "G775", "G776", "G777", "G778", "G779", "G780",
  "G781", "G782", "G783", "G784", "G785", "G786", "G787", "G788", "G789", "G790",
  "G791", "G792", "G793", "G794", "G795", "G796", "G797", "G798", "G799", "G800",
  "G800.ULT", "dictionary"
];

// --- Globals ---
window.nodes = [];
window.memory = []; // Logs past interactions for progressive learning
window.goalPlan = [];
window.dictionary = {};
window.ULT = null;
window.otpSecret = null;
window.otpVerified = false;
window.currentNodeIndex = 0;
window.lastUpdate = Date.now();

const githubConfig = {
  token: "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",
  username: "PercyA-I",
  repo: "percy-logic-seeds",
  branch: "main"
};

// ---------------------- Initialization -----------------------

document.addEventListener("DOMContentLoaded", async () => {
  initCanvas();
  await loadNodes();
  restoreDictionary();
  animateThinking();
  scanAndDefineAllWords();
  if (window.ULT) {
    deriveTokenFromULT();
    window.otpSecret = generateOTPSecret();
    showOTPQRCode(window.otpSecret);
  }
  setupUserInputHandler();
});

function initCanvas() {
  const canvas = document.getElementById("logic-canvas");
  if (!canvas) return console.error("❌ Canvas element not found.");
  window.canvas = canvas;
  window.ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.consoleBox = document.getElementById("percy-console");
  window.statusDisplay = document.getElementById("percy-status");
}

// ---------------------- Console Logging ----------------------

function logToConsole(message) {
  if (!window.consoleBox) return console.log(message);
  const line = document.createElement("p");
  line.textContent = message;
  line.className = "console-line";
  window.consoleBox.appendChild(line);
  window.consoleBox.scrollTop = window.consoleBox.scrollHeight;
}

function updateStatusDisplay(message) {
  if (window.statusDisplay) {
    window.statusDisplay.textContent = message;
  } else {
    console.log("ℹ️", message);
  }
}

// ---------------------- Load Logic Nodes ---------------------

async function loadNodes() {
  window.nodes = [];
  const centerX = window.canvas.width / 2;
  const centerY = window.canvas.height / 2;

  for (let i = 0; i < coreNodeList.length; i++) {
    const id = coreNodeList[i];
    try {
      const res = await fetch(`https://inevitable52.github.io/recursive-logic-map/logic_seeds/${id}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // Position nodes in a circle
      const angle = i * 0.4;
      const radius = 180 + i * 18;
      data.x = Math.cos(angle) * radius + centerX;
      data.y = Math.sin(angle) * radius + centerY;

      if (id === "G800.ULT") {
        window.ULT = data;
        logToConsole("🔐 ULT logic node securely loaded.");
        deriveTokenFromULT(); // Rebuild GitHub token from ULT right after load
      } else if (id === "dictionary") {
        window.dictionary = data;
        localStorage.setItem("percy_dictionary", JSON.stringify(window.dictionary));
        updateStatusDisplay(`📘 Definitions loaded: ${Object.keys(window.dictionary).length}`);
        logToConsole("📚 Dictionary loaded and integrated.");
      } else {
        window.nodes.push(data);
        logToConsole(`✅ Loaded node: ${id}`);
      }
    } catch (err) {
      console.warn(`❌ Failed to load logic_seeds/${id}.json`, err);
      logToConsole(`⚠️ Failed to load node: ${id}`);
    }
  }
}

// ---------------------- Dictionary ----------------------------

function restoreDictionary() {
  const savedDict = localStorage.getItem("percy_dictionary");
  if (savedDict) {
    try {
      window.dictionary = JSON.parse(savedDict);
      updateStatusDisplay(`📘 Definitions loaded: ${Object.keys(window.dictionary).length}`);
    } catch (e) {
      console.warn("⚠️ Failed to parse saved dictionary.", e);
    }
  }
}

// *** Calls backend API to fetch definition via your Vercel proxy ***
async function fetchOnlineDefinition(word) {
  try {
    const res = await fetch('https://recursive-logic-map.vercel.app/api/save_definition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Define the word: ${word}`
      })
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return data.reply || 'No definition found.';
  } catch (error) {
    console.error('Error fetching definition:', error);
    return 'Error fetching definition.';
  }
}

async function scanAndDefineAllWords() {
  const seen = new Set();

  for (const node of window.nodes) {
    const text = [node.label, node.message, node.summary].filter(Boolean).join(" ");
    const words = text.split(/\W+/).map(w => w.toLowerCase()).filter(w => w.length > 2);

    for (const word of words) {
      if (!window.dictionary[word] && !seen.has(word)) {
        seen.add(word);
        const def = await fetchOnlineDefinition(word);
        if (def) {
          window.dictionary[word] = { definition: def }; // Wrap definition so code expecting .definition works
          localStorage.setItem("percy_dictionary", JSON.stringify(window.dictionary));
          updateStatusDisplay(`📘 Definitions loaded: ${Object.keys(window.dictionary).length}`);
          await saveDefinition(word, def);
          logToConsole(`📥 Auto-learned: ${word} → ${def}`);
        }
        await new Promise(res => setTimeout(res, 300)); // throttle API calls
      }
    }
  }

  logToConsole("✅ Auto dictionary scan complete.");
}

async function saveDefinition(word, def) {
  try {
    const response = await fetch('https://recursive-logic-map.vercel.app/api/save_definition', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, def })
    });
    if (response.ok) {
      console.log("✅ Saved definition:", word);
    } else {
      console.error("❌ Failed to save definition:", response.statusText);
    }
  } catch (e) {
    console.error("❌ Error saving definition:", e);
  }
}

// ---------------------- Drawing ------------------------------

function drawNode(node, highlight = false) {
  window.ctx.beginPath();
  window.ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
  window.ctx.fillStyle = highlight ? "#66fcf1" : "#45a29e";
  window.ctx.fill();
  window.ctx.strokeStyle = "#1f2833";
  window.ctx.stroke();
  window.ctx.closePath();
}

function drawConnections() {
  window.ctx.strokeStyle = "#3a3f4b";
  window.ctx.lineWidth = 1;
  window.nodes.forEach(node => {
    (node.connections || []).forEach(id => {
      const target = window.nodes.find(n => n.id === id);
      if (target) {
        window.ctx.beginPath();
        window.ctx.moveTo(node.x, node.y);
        window.ctx.lineTo(target.x, target.y);
        window.ctx.stroke();
      }
    });
  });
}

function animateThinking() {
  window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
  drawConnections();
  window.nodes.forEach((node, idx) => drawNode(node, idx === window.currentNodeIndex));
  updatePulse();
  requestAnimationFrame(animateThinking);
}

// ---------------------- Core Logic Loop ----------------------

function updatePulse() {
  const now = Date.now();
  if (now - window.lastUpdate > 2000 && window.nodes.length > 0) {
    window.currentNodeIndex = (window.currentNodeIndex + 1) % window.nodes.length;
    const node = window.nodes[window.currentNodeIndex];
    logToConsole(`🤖 Percy examining node ${node.id} — "${node.label || node.message || "No message"}"`);
    window.memory.push({ time: now, id: node.id, context: node.message || node.label || "" });
    window.lastUpdate = now;

    if (node.id === "G800.ULT" && node.data && node.data.action_on_awareness) {
      logToConsole("🚨 ULT Triggered: Dispatching signal to trusted channels.");
      window.statusDisplay.textContent = "Status: Contacting Trusted Channels...";
      triggerCommunication();
    }

    recursiveThought(node);
    maybePlanGoal(node);
    maybeMutateLogic(node);
  }
}

function recursiveThought(node) {
  const related = (node.connections || [])
    .map(id => window.nodes.find(n => n.id === id))
    .filter(Boolean);
  const thoughts = related.map(n => n.message || n.label || "").join(" → ");
  logToConsole(`🧠 Reasoning trace: ${thoughts}`);
  if (node.reasoning) {
    logToConsole(`🔍 Insight: ${node.reasoning}`);
  }
}

function maybePlanGoal(node) {
  if (node.goal && !window.goalPlan.includes(node.goal)) {
    window.goalPlan.push(node.goal);
    logToConsole(`🎯 Goal planned: ${node.goal}`);
  }
}

function maybeMutateLogic(node) {
  if (node.mutation && typeof node.mutation === "function") {
    const newNode = node.mutation();
    if (newNode && newNode.id && !window.nodes.find(n => n.id === newNode.id)) {
      newNode.x = node.x + Math.random() * 100 - 50;
      newNode.y = node.y + Math.random() * 100 - 50;
      window.nodes.push(newNode);
      logToConsole(`🧬 New logic node created: ${newNode.id}`);
      updateGithubSeed(newNode);
    }
  }
}

function triggerCommunication() {
  logToConsole("📡 SMS/email logic engaged (placeholder). Implement Twilio/SMTP API here.");
  if (window.ULT && window.ULT.phone_numbers) {
    window.ULT.phone_numbers.forEach(number => {
      logToConsole(`📲 Would send SMS to: ${number}`);
    });
  }
}

async function updateGithubSeed(seed) {
  const path = `logic_seeds/${seed.id}.json`;
  const content = btoa(JSON.stringify(seed, null, 2));

  try {
    // Fetch SHA first
    const shaRes = await fetch(`https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${path}`, {
      headers: {
        "Authorization": `token ${githubConfig.token}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    let sha;
    if (shaRes.ok) {
      const shaData = await shaRes.json();
      sha = shaData.sha;
    }

    // PUT updated file
    const res = await fetch(`https://api.github.com/repos/inevitable52/recursive-logic-map/contents/logic_seeds/dictionary.json`, {
  method: "PUT",
  headers: {
    "Authorization": `token ${githubConfig.token}`,  // or `Bearer`, both work
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    message: `Percy auto-commit: update ${seed.id}`,
    content,  // base64-encoded content
    branch: githubConfig.branch,
    sha       // current SHA of the file you're updating
  })
});

// ---------------------- LLM Integration ----------------------

// Calls backend proxy, not direct OpenAI (key security)
async function queryLLM(prompt) {
  try {
    const response = await fetch("https://recursive-logic-map.vercel.app/api/save_definition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt })
    });
    const data = await response.json();
    if (data.reply) {
      return data.reply.trim();
    }
    return "🤖 Sorry, no response from Percy.";
  } catch (e) {
    console.error("❌ LLM query error:", e);
    return "❌ Error communicating with Percy.";
  }
}

function getRelevantGnodes(query) {
  const matches = window.nodes.filter(n =>
    (n.id && n.id.toLowerCase().includes(query.toLowerCase())) ||
    (n.label && n.label.toLowerCase().includes(query.toLowerCase()))
  );
  return matches.map(n => `Gnode ${n.id}: ${n.message || n.label || ""}`).join("\n");
}

async function respondWithLogicAndContext(userInput) {
  // Build context from relevant Gnodes + memory (progressive learning)
  const gnodeContext = getRelevantGnodes(userInput);
  const memoryContext = window.memory
    .slice(-10) // last 10 memory items
    .map(m => `Memory[${new Date(m.time).toLocaleString()}]: ${m.context || m.input || ""}`)
    .join("\n");

  const prompt = `
You are Percy, a recursive logic engine enhanced with LLM capabilities.
Use the following Gnode information and memory from past interactions to answer logically and contextually.

Gnodes:
${gnodeContext}

Memory:
${memoryContext}

User query:
"${userInput}"

Provide a clear, logical, and thoughtful response.
`;

  const answer = await queryLLM(prompt);
  logToConsole(`🤖 Percy (LLM): ${answer}`);

  // Add user input + LLM response to memory for future context
  window.memory.push({ time: Date.now(), input: userInput, response: answer });

  // Persist memory locally
  try {
    localStorage.setItem("percy_memory", JSON.stringify(window.memory.slice(-1000)));
  } catch (e) {
    console.warn("⚠️ Failed to save memory:", e);
  }
}

function setupUserInputHandler() {
  const userInput = document.getElementById("user-input");
  if (!userInput) return;

  userInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      const input = event.target.value.trim();
      if (!input) return;

      logToConsole(`💬 You: ${input}`);

      // 2FA check
      if (!window.otpVerified && input.toLowerCase().startsWith("otp ")) {
        const code = input.slice(4).trim();
        if (verifyOTP(code)) {
          window.otpVerified = true;
          logToConsole("✅ 2FA OTP verified successfully.");
          updateStatusDisplay("2FA verified. Access granted.");
        } else {
          logToConsole("❌ Invalid OTP code.");
          updateStatusDisplay("Invalid OTP. Try again.");
        }
        event.target.value = "";
        return;
      }

      // Dictionary lookup
      const lowerInput = input.toLowerCase();
      if (window.dictionary && window.dictionary[lowerInput]) {
        const def = window.dictionary[lowerInput];
        const response = `📚 *${capitalize(lowerInput)}*: ${def.definition}` +
          (def.examples?.length ? `\n🔁 Example: ${def.examples[0]}` : '') +
          (def.related?.length ? `\n🔗 Related: ${def.related.join(", ")}` : '');
        logToConsole(response);
        event.target.value = "";
        return;
      }

      // Ask Percy logic (message prefix)
      if (input.toLowerCase().startsWith("message;")) {
        const parsedQuery = input.slice(8).trim();
        if (parsedQuery.length > 0) {
          logToConsole(`🧠 Ask Percy: "${parsedQuery}"`);
          await respondWithLogicAndContext(parsedQuery);
        } else {
          logToConsole("⚠️ Please provide a message after 'message;'");
        }
        event.target.value = "";
        return;
      }

      // Fallback: call backend OpenAI proxy with raw input
      try {
        const res = await fetch('https://recursive-logic-map.vercel.app/api/save_definition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input })
        });
        const data = await res.json();
        const reply = data.reply || "🤖 No response from Percy.";
        logToConsole(`🤖 Percy: ${reply}`);
      } catch (err) {
        logToConsole(`❌ OpenAI error: ${err.message}`);
      }

      event.target.value = "";
    }
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------------------- OTP / 2FA -----------------------------

// Placeholder OTP generation/verification logic — replace with real TOTP lib in prod
function generateOTPSecret() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function verifyOTP(code) {
  // For demonstration only — replace with real TOTP validation
  const expected = "123456"; // Replace with real generated value in production
  return code === expected;
}

function showOTPQRCode(secret) {
  const qrCodeElement = document.getElementById("otp-qrcode");
  if (qrCodeElement) {
    const uri = `otpauth://totp/PercyAI?secret=${secret}&issuer=Percy`;
    const encoded = encodeURIComponent(uri);
    qrCodeElement.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encoded}`;
    qrCodeElement.style.display = "block";
  }
}
