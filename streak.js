// ===== Logic streak: đếm số ngày liên tiếp người dùng vào trang =====
// Lưu trong localStorage -> tính theo TỪNG THIẾT BỊ (trình duyệt), không đồng bộ
// qua backend hay thiết bị khác.
//
// Quy tắc:
//  - Vào lần đầu tiên: streak = 1
//  - Vào đúng 1 ngày sau lần vào gần nhất: streak + 1
//  - Nghỉ đúng 1 ngày (quay lại sau 2 ngày): streak giữ nguyên ("đóng băng")
//  - Nghỉ từ 2 ngày trở lên (quay lại sau 3 ngày trở lên): streak về lại 1
//  - Vào lại trong cùng 1 ngày: không đổi gì

const STREAK_KEY = "streak-data"; // { lastVisitDate: "YYYY-MM-DD", streak: number }

const streakValueEl = document.getElementById("streakValue"); // nơi print số streak
const streakMsgEl   = document.getElementById("streakMsg");

// Đổi Date thành chuỗi "YYYY-MM-DD" theo giờ địa phương của thiết bị
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Số ngày chênh lệch giữa 2 chuỗi "YYYY-MM-DD"
function diffInDays(dateKeyA, dateKeyB) {
  const a = new Date(dateKeyA + "T00:00:00");
  const b = new Date(dateKeyB + "T00:00:00");
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function loadStreakData() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data.streak === "number" && typeof data.lastVisitDate === "string") {
      return data;
    }
  } catch (e) {}
  return null;
}

function saveStreakData(data) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function renderStreak(streak, message) {
  streakValueEl.textContent = streak;   // <-- PRINT giá trị streak lên màn hình
  streakMsgEl.textContent = message || "";
}

function updateStreak() {
  const today = toDateKey(new Date());
  const data = loadStreakData();

  // Chưa từng vào trang trên thiết bị này
  if (!data) {
    saveStreakData({ lastVisitDate: today, streak: 1 });
    renderStreak(1, "");
    return;
  }

  const diff = diffInDays(data.lastVisitDate, today);

  if (diff <= 0) {
    // Đã vào trong cùng ngày hôm nay rồi -> không đổi gì
    renderStreak(data.streak, "");
  } else if (diff === 1) {
    // Vào liên tiếp ngày hôm sau -> +1
    const newStreak = data.streak + 1;
    saveStreakData({ lastVisitDate: today, streak: newStreak });
    renderStreak(newStreak, "");
  } else if (diff === 2) {
    // Nghỉ đúng 1 ngày -> đóng băng, giữ nguyên giá trị
    saveStreakData({ lastVisitDate: today, streak: data.streak });
    renderStreak(data.streak, "Streak đang đóng băng vì bạn đã nghỉ 1 ngày.");
  } else {
    // Nghỉ từ 2 ngày trở lên -> reset về 1
    saveStreakData({ lastVisitDate: today, streak: 1 });
    renderStreak(1, "Streak đã về lại 1 vì bạn đã nghỉ nhiều ngày.");
  }
}

// Không tự chạy ở đây nữa -> start-screen.js sẽ gọi updateStreak()
// ngay sau khi người dùng bấm nút "study".
