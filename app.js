const express = require('express');
const app = express();
const path = require('path');
const route = require('./Routes/route');
const LoginRouter = require('./Routes/api/auth');
const RegisterRouter = require('./Routes/api/registerRoutes');
const ParticipantsRouter = require('./Routes/api/participantsRoutes');
const scanRoutes = require('./Routes/api/scanRoutes');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const upload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));
app.use(upload());

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb',        // Adjust the payload limit as needed
  parameterLimit: 100000  // Increase the number of parameters
}));
// Configure body-parser for JSON data
app.use(bodyParser.json({ limit: '50mb' }));
app.set('layout', 'layout/layout');
app.use(expressLayouts);

app.use(express.static(__dirname + '/public'));


app.use('/auth',LoginRouter);
app.use('/register',RegisterRouter);
app.use('/participants',ParticipantsRouter);
app.use('/scan',scanRoutes);
app.use('/', route);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  // next(err);
  // res.render('auth-404-cover');
  res.render('auth/auth-404-cover', { title: '404', layout: './layout/layout-withoutNav' })
});
// Middleware untuk error handling
app.use((err, req, res, next) => {
  if (err.status === 503) {
      // Render halaman auth-offline.ejs jika ada kesalahan koneksi database
      res.status(503).render('auth/auth-offline', { title: 'Offline', layout: './layout/layout-withoutNav' });
  } else {
      // Tangani kesalahan lainnya
      res.status(err.status || 500);
      res.json({
          message: err.message,
          error: err
      });
  }
});

const http = require("http").createServer(app);
http.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
