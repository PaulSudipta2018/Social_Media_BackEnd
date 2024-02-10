const express = require("express");

const app = express();
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");

dotenv.config();
mongoose.connection.on('connected', () => console.log('connected'));
mongoose.connect(process.env.MONGO_URL);

//middleware

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);



app.listen(8800, () => {
    console.log("Server is running");
})