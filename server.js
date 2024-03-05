/* eslint-disable */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const serveStatic = require("serve-static");
const path = require("path");
var config;
if (process.env.NODE_ENV !== "production") {
  config = require("./config/settings");
} else {
  require("./createEnv");
}
//var history = require('connect-history-api-fallback');

// Set up the app
const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'http://spotilize.uc.r.appspot.com',
  'https://spotilize.uc.r.appspot.com',
  'wss://spotilize.uc.r.appspot.com',
  'https://tiles-416322.web.app'
];

// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin 
//     // (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not ' +
//         'allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: false,
// };

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

// app.use(cors(corsOptions));
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var server = require("http").createServer(app);
var io = require("socket.io")(server, {

  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": true
    };

    if (allowedOrigins.includes(req.headers.origin)) {
      headers["Access-Control-Allow-Origin"] = req.headers.origin; //or the specific origin you want to give access to,    
    }

    res.writeHead(200, headers);
    res.end();
  }
});

const spotifyRoutes = require("./expressRoutes/spotifyRoutes.js")(app, io);
app.use("/spotify", spotifyRoutes);
// If not accessing the API, serve up the frontend
app.use(
  "/",
  serveStatic(path.join(__dirname, "/dist"), {
    etag: false,
    lastModified: false,
  })
);
// Catch all routes and redirect to the index file
app.get("*", (req, res) => {
  res.set({ "Content-Type": "text/html" });
  res.sendFile(path.join(__dirname, "/dist/index.html"), {
    etag: false,
    lastModified: false,
  });
});

/*// Middleware for serving '/dist' directory
const staticFileMiddleware = express.static('dist');

// 1st call for unredirected requests 
app.use(staticFileMiddleware);

// Support history api 
app.use(history({
  index: '/dist/index.html'
}));

// 2nd call for redirected requests
app.use(staticFileMiddleware);*/

// Listen for connections to the port
const port = process.env.PORT || config.serverPort;
var baseURL = process.env.baseURL || config.baseURL;
server.listen(port, () =>
  console.log("Server listening on port " + baseURL + port)
);
