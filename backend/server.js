require("dotenv").config();
const app = require("./src/app");

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});