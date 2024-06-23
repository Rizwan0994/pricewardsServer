'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'production';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(mongoose);
    db[model.modelName] = model;
    console.log(`Model added: ${model.modelName}`);
  });

db.config = config;
module.exports = db;