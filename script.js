/* ================= ELEMENTS ================= */
const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const htmlCode = document.getElementById("htmlCode");
const cssCode = document.getElementById("cssCode");
const jsCode = document.getElementById("jsCode");

const preview = document.getElementById("preview");

const previewToggle = document.getElementById("previewToggle");
const fullscreenPreview = document.getElementById("fullscreenPreview");
const fullPreviewFrame = document.getElementById("fullPreviewFrame");
const exitPreview = document.getElementById("exitPreview");

/* ================= PRELOADER ================= */
window.onload = () => {
  setTimeout(() => {
    document.getElementById("preloader").style.display = "none";

    addMessage(
      "👋 Hi! I can generate, fix and display frontend code.\n\nTry one of the suggestions below 🚀",
      "ai",
      true
    );
  }, 800);
};

/* ================= CHAT ================= */
function addMessage(text, type, isTyping = false) {
  const msg = document.createElement("div");
  msg.classList.add("message", type);
  chatContainer.appendChild(msg);

  if (isTyping) {
    let i = 0;
    function typeWriter() {
      if (i < text.length) {
        msg.innerText += text.charAt(i);
        i++;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        setTimeout(typeWriter, 20);
      }
    }
    typeWriter();
  } else {
    msg.innerText = text;
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* ================= AI ================= */
async function generateAIResponse(userText) {
  try {
    showToast("Thinking... 🤖");

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: userText })
    });

    const data = await response.json();
    console.log("API Response:", data);

    extractAndFillCode(data.reply);

    return formatResponse(data.reply);

  } catch (error) {
    console.error(error);
    return "❌ Error connecting to server.";
  }
}

/* ================= SEND ================= */
sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");

  const suggestions = document.querySelector(".suggestions");
  if (suggestions) suggestions.style.display = "none";

  input.value = "";

  // loading message
  const loadingMsg = document.createElement("div");
  loadingMsg.classList.add("message", "ai");
  loadingMsg.innerText = "⏳ Generating...";
  chatContainer.appendChild(loadingMsg);

  try {
    const reply = await generateAIResponse(text);

    // remove loading
    loadingMsg.remove();

    // ✅ FIX: ensure something always shows
    const finalReply =
      reply && reply.trim()
        ? reply
        : "✅ Code generated. Check the right panel 👉";

    addMessage(finalReply, "ai", true);

  } catch (err) {
    console.error(err);
    loadingMsg.innerText = "❌ Error getting response";
  }
}

/* ================= CODE PARSER ================= */
function extractAndFillCode(text) {
  const htmlMatch = text.match(/```html([\s\S]*?)```/i);
  const cssMatch = text.match(/```css([\s\S]*?)```/i);
  const jsMatch = text.match(/```(javascript|js)([\s\S]*?)```/i);

  htmlCode.value = htmlMatch ? htmlMatch[1].trim() : "";
  cssCode.value = cssMatch ? cssMatch[1].trim() : "";
  jsCode.value = jsMatch ? jsMatch[2].trim() : "";

  if (!htmlMatch && text.includes("<")) {
    htmlCode.value = text;
  }

  runCode();
}

/* ================= FORMAT ================= */
function formatResponse(text) {
  return text.replace(/```[\s\S]*?```/g, "").trim();
}

/* ================= LIVE PREVIEW ================= */
function getFullCode() {
  return `
    <html>
      <head>
        <style>${cssCode.value}</style>
      </head>
      <body>
        ${htmlCode.value}
        <script>${jsCode.value}<\/script>
      </body>
    </html>
  `;
}

function runCode() {
  
  if (fullPreviewFrame) {
    fullPreviewFrame.srcdoc = getFullCode();
  }
}

document.getElementById("runCode").addEventListener("click", runCode);

previewToggle.addEventListener("click", () => {
  if (!htmlCode.value.trim() && !cssCode.value.trim() && !jsCode.value.trim()) {
    fullPreviewFrame.srcdoc = `
      <html>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
          <h2>No code to preview yet</h2>
        </body>
      </html>
    `;
  } else {
    fullPreviewFrame.srcdoc = getFullCode();
  }

  fullscreenPreview.classList.remove("hidden");
});

if (exitPreview && fullscreenPreview) {
  exitPreview.addEventListener("click", () => {
    fullscreenPreview.classList.add("hidden");
    document.body.style.overflow = "auto";
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    fullscreenPreview.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
});

/* ================= TOAST ================= */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

/* ================= ACTIONS ================= */
document.getElementById("copyCode").addEventListener("click", () => {
  navigator.clipboard.writeText(htmlCode.value);
  showToast("Copied ✅");
});

document.getElementById("downloadCode").addEventListener("click", () => {
  const blob = new Blob([htmlCode.value], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "index.html";
  a.click();

  showToast("Downloaded 📁");
});

document.getElementById("saveProject").addEventListener("click", () => {
  localStorage.setItem("html", htmlCode.value);
  localStorage.setItem("css", cssCode.value);
  localStorage.setItem("js", jsCode.value);
  showToast("Saved 💾");
});

document.getElementById("loadProject").addEventListener("click", () => {
  htmlCode.value = localStorage.getItem("html") || "";
  cssCode.value = localStorage.getItem("css") || "";
  jsCode.value = localStorage.getItem("js") || "";

  runCode();
  showToast("Loaded 📂");
});

document.getElementById("clearChat").addEventListener("click", () => {
  chatContainer.innerHTML = "";
});

/* ================= TABS ================= */
document.querySelectorAll(".tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".code-area textarea").forEach(t =>
      t.classList.add("hidden")
    );

    if (btn.dataset.tab) {
      document.getElementById(btn.dataset.tab + "Code").classList.remove("hidden");
    }
  });
});

/* ================= RESIZER ================= */
const resizer = document.getElementById("resizer");
let isDragging = false;

resizer.addEventListener("mousedown", () => (isDragging = true));

document.addEventListener("mousemove", e => {
  if (!isDragging) return;

  let newWidth = (e.clientX / window.innerWidth) * 100;
  if (newWidth < 30) newWidth = 30;
  if (newWidth > 80) newWidth = 80;

  document.querySelector(".chat-section").style.width = newWidth + "%";
});

document.addEventListener("mouseup", () => (isDragging = false));

/* ================= SUGGESTIONS ================= */
document.querySelectorAll(".suggestion").forEach(btn => {
  btn.addEventListener("click", () => {
    input.value = btn.innerText;
    sendMessage();
  });
});
document.getElementById("deployNetlify").onclick = async () => {
  if (!htmlCode.value.trim()) {
    alert("No code to deploy!");
    return;
  }

  // create ZIP
  const zip = new JSZip();

  zip.file("index.html", htmlCode.value);
  zip.file("style.css", cssCode.value);
  zip.file("script.js", jsCode.value);

  const content = await zip.generateAsync({ type: "blob" });

  // download ZIP
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = "project.zip";
  a.click();
  showToast("Opening Netlify... 🚀");

  // open netlify
  setTimeout(() => {
    window.open("https://app.netlify.com/drop", "_blank");
  }, 1000);
};