var mongoose = require("mongoose");
const { configDotenv } = require('dotenv');
configDotenv();

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Database Connected Successfully");
}).catch((err) => {
    console.log("No Connection to Database");
})