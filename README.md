# passport-forward-auth

Small library for nodejs to use HTTP headers authentication behind traefik forward-auth.

## Example how to use it:

```ts
import express, { Application } from 'express';
import { authenticate, use, initialize, Strategy } from 'passport';
import { ForwardAuthStrategy, VerifyFunction } from 'passport-forward-auth';

const port = 8082;

const authHeaders = ['X-ForwardUser', 'X-ForwardUserEmail'];

const app: Application = express();

const verifyFn: VerifyFunction = (verifyHeaders, done) => {
  console.log('have user data found in headers', verifyHeaders);
  return !verifyHeaders ? done(null) : done(null, { id: 'user_id' });
};

const createStrategy = (): Strategy => new ForwardAuthStrategy({ authHeaders }, verifyFn);

use(createStrategy());

app.use(initialize());

app.get('/auth/forward-auth', authenticate('forward-auth', { session: false }), (req, res) => {
  res.send({ status: 'ok', user: req.user });
});
```
