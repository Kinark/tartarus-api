require('dotenv').config()
require('./db')

const app = require('express')()
const cors = require('cors')
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = 3000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

//
// ─── MIDDLEWARES ────────────────────────────────────────────────────────────────
//

app.use(cors)
app.use(bodyParser.json())
app.use(cookieParser())
app.use((req, res, next) => {
   res.type('json');
   req.eita = 'hehehe'
   next();
});
app.use(function (error, req, res, next) {
   if (error instanceof SyntaxError) {
      res.status(400).send({ msg: 'Something went really really wrong with the syntax (probably broken JSON).' });
   } else {
      next();
   }
});
app.use(require('./api/user/middlewares').reqWithJwt)

//
// ─── ROUTES ─────────────────────────────────────────────────────────────────────
//

app.get('/', (req, res) => res.send('Hello World!'))

app.use(require('./api/user/routes'))

app.all('*', (req, res) => res.status(404).send({ msg: 'not found' }))

//
// ─── INITIALIZATION ─────────────────────────────────────────────────────────────
//

server.listen(port, () => console.log(`Example app listening on port ${port}!`))
