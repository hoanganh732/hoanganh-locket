// require("dotenv").config();
const dotenv = require("dotenv");

const express = require("express");
const cors = require("cors");

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

    dotenv.config({ path: envFile });


const routes = require("./src/routes");
const { logGroupWrapper, logInfo } = require("./src/utils/logEventUtils");

const app = express();

// ✅ Cấu hình CORS nâng cao
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/, // localhost:*
    /^https:\/\/hoanganh-locket\.vercel\.app$/  // Cho phép tên miền Vercel của bạn anhdev
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Cho phép request từ cùng server (ex: curl)
      if (allowedOrigins.some((pattern) => pattern.test(origin))) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Nếu bạn cần gửi cookie/authorization
  }),
);

// Các middleware khác
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logGroupWrapper);

// Nạp các route vào ứng dụng
routes(app);

// Khởi động server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  logInfo("SERVER", `🚀 Backend đang chạy tại http://localhost:${PORT}`);
});
