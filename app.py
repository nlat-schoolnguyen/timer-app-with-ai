"""
Backend nhận câu hỏi từ frontend, gọi web Gemini (Google Generative AI),
rồi trả câu trả lời về cho frontend hiển thị trong cửa sổ chat.

Chạy thử:
    pip install -r requirements.txt
    cp .env.example .env      # rồi điền GEMINI_API_KEY vào file .env
    python app.py
"""

import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import google.generativeai as genai

load_dotenv()  # đọc file .env, lấy GEMINI_API_KEY

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)  # cho phép frontend (chạy ở domain/port khác) gọi tới backend này


@app.route("/api/chat", methods=["POST"])
def chat():
    if not GEMINI_API_KEY:
        return jsonify({"error": "Chưa cấu hình GEMINI_API_KEY trên backend."}), 500

    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()

    if not question:
        return jsonify({"error": "Thiếu câu hỏi (question)."}), 400

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        result = model.generate_content(question)
        answer = result.text
    except Exception as exc:  # báo lỗi rõ ràng cho frontend hiển thị
        return jsonify({"error": f"Lỗi khi gọi Gemini: {exc}"}), 502

    return jsonify({"answer": answer})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    # debug=True chỉ dùng khi phát triển, tắt khi triển khai thật
    app.run(host="0.0.0.0", port=5000, debug=True)
