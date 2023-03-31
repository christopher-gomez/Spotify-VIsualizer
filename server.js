/* eslint-disable */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const serveStatic = require('serve-static')
const path = require('path')
var config;
if (process.env.NODE_ENV !== 'production') {
	config = require('./config/settings');
}
//var history = require('connect-history-api-fallback');

// Set up the app
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
const spotifyRoutes = require('./expressRoutes/spotifyRoutes.js')(app, io);
app.use('/spotify', spotifyRoutes);
// If not accessing the API, serve up the frontend
app.use("/", serveStatic(path.join(__dirname, "/dist"), { etag: false, lastModified: false }));
// Catch all routes and redirect to the index file
app.get("*", (req, res) => {
  res.set({ "Content-Type": "text/html" });
  res.sendFile(path.join(__dirname, "/dist/index.html"), { etag: false, lastModified: false });
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
server.listen(port, () => console.log('Server listening on port ' + baseURL + port));
