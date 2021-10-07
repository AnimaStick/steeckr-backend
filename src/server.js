const express = require('express');
require('dotenv').config();
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(routes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`API running on port ${PORT} - DB HOST ${process.env.DB_HOST}`));