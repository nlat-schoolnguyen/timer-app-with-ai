// ===== Logic cửa sổ chat: mở/đóng, gửi câu hỏi, nhận câu trả lời từ backend =====

// Đổi địa chỉ này nếu backend chạy ở cổng hoặc tên miền khác
const CHAT_API_URL = "https://timer-app-with-ai.onrender.com/api/chat";

const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatWindow    = document.getElementById("chatWindow");
const chatCloseBtn  = document.getElementById("chatCloseBtn");
const chatMessages  = document.getElementById("chatMessages"); // nơi in hội thoại
const chatForm      = document.getElementById("chatForm");
const chatInput     = document.getElementById("chatInput");
const chatSendBtn   = document.getElementById("chatSendBtn");

// Mở cửa sổ chat
chatToggleBtn.addEventListener("click", () => {
  chatWindow.hidden = false;
  chatToggleBtn.setAttribute("aria-expanded", "true");
  chatInput.focus();
});

// Đóng cửa sổ chat
chatCloseBtn.addEventListener("click", () => {
  chatWindow.hidden = true;
  chatToggleBtn.setAttribute("aria-expanded", "false");
});

// In một dòng hội thoại lên màn hình (role: "user" hoặc "bot")
function appendMessage(role, text) {
  const line = document.createElement("div");
  line.className = "chat-message chat-message-" + role;
  line.textContent = (role === "user" ? "Bạn: " : "Gemini: ") + text;
  chatMessages.appendChild(line);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return line;
}

// Gửi câu hỏi qua backend, backend sẽ gọi Gemini rồi trả câu trả lời về
async function askBackend(question) {
  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error("Lỗi backend (" + response.status + "): " + errText);
  }

  const data = await response.json(); // backend trả về { answer: "..." }
  return data.answer;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;

  appendMessage("user", question);     // <-- PRINT câu hỏi lên cửa sổ chat
  chatInput.value = "";
  chatSendBtn.disabled = true;

  const loadingLine = appendMessage("bot", "đang trả lời...");

  try {
    const answer = await askBackend(question);
    loadingLine.textContent = "Gemini: " + answer;   // <-- PRINT câu trả lời lên cửa sổ chat
  } catch (err) {
    loadingLine.textContent = "Gemini: (lỗi) " + err.message;
  } finally {
    chatSendBtn.disabled = false;
    chatInput.focus();
  }
});
