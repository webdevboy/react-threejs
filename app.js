import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import path from 'path';
import template from './src/template';
import ssr from './src/server';

import './server/auth';

const app = express();
const csv = require('csv-parser');
const fs = require('fs');

// Serving static files
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));

// Setup passport for auth
app.use(passport.initialize());
app.use(passport.session())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// hide powered by express
app.disable('x-powered-by');

app.listen(process.env.PORT || 3000);

// Getting mesh items from .csv
let meshItems = [];
fs.createReadStream('mesh.csv')
  .pipe(csv())
  .on('data', (row) => {
    meshItems.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// Setup initial state
let initialState = {
  meshItems,
};


app.post('/login', (req, res, next) => {
  passport.authenticate('localSignin', (err, user, info) => {
    if (user) {
      res.send({ user, info });
    } else {
      res.send({ error: err, info });
    }
  })(req, res, next);
});


app.get('/*', (req, res) => {
  const context = {};
  const { preloadedState, content } = ssr(initialState, req, context);
  const response = template("Mesh", preloadedState, content);
  res.send(response);
});


