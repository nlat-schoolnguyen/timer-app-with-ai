// ===== Logic màn hình bắt đầu: bấm "study" mới hiện giao diện timer =====

const startScreen = document.getElementById("startScreen");
const timerScreen  = document.getElementById("timerScreen");
const studyBtn     = document.getElementById("studyBtn");

studyBtn.addEventListener("click", () => {
  startScreen.hidden = true;
  timerScreen.hidden = false;
  updateStreak(); // tính streak ngay lúc này, hàm được định nghĩa trong streak.js
});
