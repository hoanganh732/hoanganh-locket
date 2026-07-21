const axios = require("axios");
// Nhúng cái file config của ní vào để lấy API Key
const config = require("../config/app.config"); 

class WeatherController {
  async getWeather(req, res, next) {
    try {
      const { lat, lon } = req.body;

      if (!lat || !lon) {
        return res.status(400).json({ status: "error", message: "Thiếu tọa độ lat, lon" });
      }

      // Kéo cái API Key từ file app.config.js ra dùng
      const apiKey = config.integrations.weatherApiKey;
      
      if (!apiKey) {
        return res.status(500).json({ status: "error", message: "Chưa setup WEATHER_API_KEY" });
      }

      // Gọi ra mạng (Đang ví dụ dùng weatherapi.com)
      const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;
      const response = await axios.get(weatherUrl);

      // Trả về Frontend đúng form nó cần: status: "success"
      return res.status(200).json({
        status: "success",
        data: response.data,
      });
    } catch (error) {
      console.error("Lỗi lấy thời tiết:", error.message);
      return res.status(500).json({ status: "error", message: "Lỗi Server" });
    }
  }
}

module.exports = new WeatherController();