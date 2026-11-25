// ===== Logic bộ đếm ngược (giống bản trước, tách thành file riêng) =====

const timeInput = document.getElementById("timeInput"); // Ô 1
const startBtn  = document.getElementById("startBtn");  // Ô 2
const pauseBtn  = document.getElementById("pauseBtn");  // nút dừng / tiếp tục
const display   = document.getElementById("display");   // nơi print
const msg       = document.getElementById("msg");

let intervalId = null;
let endAt = null;       // mốc thời điểm kết thúc (khi đang chạy)
let remaining = 0;      // số giây còn lại (khi đang dừng)
let isPaused = false;

// Đổi số giây thành chuỗi hh:mm:ss
function format(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
}

// Đọc "hh:mm:ss" (cũng nhận "mm:ss" hoặc "ss") và trả về tổng số giây
function parse(text) {
  const parts = text.trim().split(":").map(Number);
  if (parts.length > 3 || parts.some(n => !Number.isInteger(n) || n < 0)) return null;
  while (parts.length < 3) parts.unshift(0);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

// Một tick: tính số giây còn lại từ mốc endAt và in ra màn hình
function tick() {
  const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  display.textContent = format(left);            // <-- PRINT mỗi giây
  if (left <= 0) {
    clearInterval(intervalId);
    intervalId = null;
    isPaused = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = "Dừng";
    msg.textContent = "Hết giờ!";
  }
}

startBtn.addEventListener("click", () => {
  const total = parse(timeInput.value);
  if (!total) { msg.textContent = "Nhập theo dạng hh:mm:ss, ví dụ 00:25:00."; return; }
  msg.textContent = "";
  isPaused = false;
  pauseBtn.disabled = false;
  pauseBtn.textContent = "Dừng";

  clearInterval(intervalId);                    // bấm start lại thì chạy lại từ đầu
  endAt = Date.now() + total * 1000;            // mốc kết thúc, giống cách timer gốc dùng

  display.textContent = format(total);          // <-- PRINT lần đầu
  intervalId = setInterval(tick, 250);
});

// Nút dừng / tiếp tục
pauseBtn.addEventListener("click", () => {
  if (!isPaused) {
    // Đang chạy -> dừng: lưu lại số giây còn lại, hủy interval
    remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    clearInterval(intervalId);
    intervalId = null;
    isPaused = true;
    pauseBtn.textContent = "Tiếp tục";
  } else {
    // Đang dừng -> tiếp tục: tính lại mốc kết thúc từ số giây đã lưu
    endAt = Date.now() + remaining * 1000;
    isPaused = false;
    pauseBtn.textContent = "Dừng";
    intervalId = setInterval(tick, 250);
  }
});
