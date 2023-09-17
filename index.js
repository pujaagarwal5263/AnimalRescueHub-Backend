const express = require('express');
const app = express();
const port = process.env.PORT || 8000; 
const router = require('./routes/router');
const { configDotenv } = require('dotenv');
configDotenv();
require("./db-connection");
//require("./data-insertion");

app.use(router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});