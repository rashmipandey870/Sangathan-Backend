require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();


// MIDDLEWARE

app.use(cors());
app.use(express.json());


// DATABASE CONNECTION

mongoose.connect(
  process.env.MONGO_URI || "mongodb+srv://yuvraj:lbSELdJIKORJePan@yuvraj.ejmdwcn.mongodb.net/?retryWrites=true&w=majority"
)
.then(() => {
  console.log(" MongoDB Connected");
})
.catch((err) => {
  console.error(" MongoDB Error:", err.message);
});


// ROUTES


const teamRoutes = require("./routes/teamRoutes");
console.log("teamRoutes:", typeof teamRoutes);

const studentRoutes = require("./routes/studentRoutes");
console.log("studentRoutes:", typeof studentRoutes);

const editRoutes = require("./routes/editRoutes");
console.log("editRoutes:", typeof editRoutes);

const selectionRoutes = require("./routes/selectionRoutes");
console.log("selectionRoutes:", typeof selectionRoutes);

const teamViewRoutes = require("./routes/teamViewRoutes");
console.log("teamViewRoutes:", typeof teamViewRoutes);

const captainRoutes = require("./routes/captainRoutes");
console.log("captainRoutes:", typeof captainRoutes);

const trialRoutes = require("./routes/trialRoutes");
console.log("trialRoutes:", typeof trialRoutes);

const adminRoutes = require("./routes/adminRoutes");
console.log("adminRoutes:", typeof adminRoutes) ;


app.use("/api", teamRoutes);
app.use("/api", studentRoutes);
app.use("/api", captainRoutes);
app.use("/api/trials", trialRoutes);
app.use("/api", require("./routes/teamViewRoutes"));
app.use("/api", require("./routes/selectionRoutes"));
app.use("/api", require("./routes/editRoutes"));
app.use("/api", require("./routes/adminRoutes"));




// SERVER START

const PORT = 8000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Server running on port ${PORT}`);
});