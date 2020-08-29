import express, { Application } from 'express';
import { authenticate, use, initialize, Strategy } from 'passport';
import { ForwardAuthStrategy, VerifyFunction } from '../lib';

const port = 8082;

const authHeaders = ['X-ForwardUser', 'X-ForwardUserEmail', 'host', 'user-agent'];

const app: Application = express();

const verifyFn: VerifyFunction = (verifyHeaders, done) => {
  console.log('have user data found', verifyHeaders);
  return !verifyHeaders ? done(null) : done(null, { id: 'ok' });
};

const createStrategy = (): Strategy => new ForwardAuthStrategy({ authHeaders }, verifyFn);

use(createStrategy());

app.use(initialize());

app.get('/auth/forward-auth', authenticate('forward-auth', { session: false }), (req, res) => {
  res.send({ status: 'ok', user: req.user });
});

app.get('/', (req, res) => {
  res.send({ hello: 'world' });
});

app.get('/current-user', (req, res) => {
  res.send(req.user);
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/cookies', (req, res) => {
  res.send(req.cookies);
});

app.listen(port, () => {
  console.log(`Test app listening at http://localhost:${port}`);
});
