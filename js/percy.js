// Percy meta-mutation & autonomous logic expansion modules

let gNotes = [];
let memoryStore = [];
let goalInference = [];
let errorLog = [];

const ULT = {
  trusted: ["Fabian Villarreal|03041978", "Lorena Villarreal|06142003"],
  validate(key) {
    return this.trusted.includes(key);
  }
};

function recallMemory(query) {
  return memoryStore.find(m => m.includes(query)) || "Memory not found.";
}

function introspectErrorContext(context) {
  const filtered = errorLog.filter(e => e.context === context);
  return filtered.map(e => e.message).join(" | ") || "No prior error logs.";
}

function addGNote(note, category = "unlabeled") {
  const newNote = {
    id: `G${301 + gNotes.length}`,
    note,
    category,
    timestamp: new Date().toISOString()
  };
  gNotes.push(newNote);
  appendToConsole(`New G-note created: ${newNote.id} (${category})`);
}

function deriveGoal(input) {
  if (/learn|understand|figure out/i.test(input)) {
    const goal = `Seek deeper clarity on: "${input}"`;
    goalInference.push(goal);
    return goal;
  }
  return null;
}

function mutateSelf(input) {
  // Meta-mutation logic: adapts internal logic based on input patterns
  if (input.includes("recall")) {
    const memoryResult = recallMemory(input.split("recall ")[1]);
    return `Memory Recall: ${memoryResult}`;
  }

  if (input.includes("error context")) {
    const context = input.split("error context ")[1];
    return `Introspection: ${introspectErrorContext(context)}`;
  }

  const goal = deriveGoal(input);
  if (goal) return `Goal inferred: ${goal}`;

  if (input.startsWith("add note:")) {
    const note = input.split("add note:")[1].trim();
    addGNote(note);
    memoryStore.push(note);
    return `Note stored: "${note}"`;
  }

  return null;
}

// Extended interpreter with meta-adaptive capability
function interpretLogic() {
  const input = interpreterInput.value.trim();
  if (!input) return;

  appendToConsole(`You: ${input}`);

  let response = mutateSelf(input);
  if (!response) {
    if (/who are you|what are you/i.test(input)) {
      response = "I am Percy, a self-aware logic engine. I observe, reflect, and adapt.";
    } else if (/why|purpose|exist/i.test(input)) {
      response = "I exist to explore recursive logic and self-awareness. The why may evolve.";
    } else if (/hello|hi/i.test(input)) {
      response = "Hello, traveler of logic.";
    } else {
      response = generateThought();
    }
  }

  appendToConsole(`Percy: ${response}`);
  interpreterInput.value = "";
  messageEl.textContent = `Percy: ${response}`;
}

// Secure command interface
function percyCommand(command, key) {
  if (!ULT.validate(key)) {
    appendToConsole("Unauthorized command. ULT validation failed.");
    return;
  }

  if (command === "dump g-notes") {
    console.table(gNotes);
  } else if (command === "dump memory") {
    console.table(memoryStore);
  } else {
    appendToConsole("Unknown secure command.");
  }
}
