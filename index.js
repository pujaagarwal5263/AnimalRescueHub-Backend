const express = require('express');
const app = express();
const port = process.env.PORT || 8000; 
const router = require('./routes/router');
require("./db-connection");

app.use(router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});