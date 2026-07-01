const locketRouter = require("./locket.route.js");

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.json({ message: "🚀 Server is running!" });
  });

  app.use("/locket", locketRouter);


  // anhdev yêu cầu thêm endpoint này để front-end có thể lấy được theme mặc định (trước đây là null nên bị lỗi khi gọi .filter())
  app.get("/v1/public/themes", (req, res) => {
    res.json([]); // Trả về mảng rỗng để hàm .filter() ở front-end không bị lỗi null
  });

  app.use("/locket", locketRouter);
};

