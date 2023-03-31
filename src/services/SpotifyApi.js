/* eslint-disable */
import axios from 'axios';
var config;
if (process.env.NODE_ENV !== 'production') {
	config = require('../../config/settings');
}
var baseURL;
var port;
if (config === undefined) {
	baseURL = "https://spotilize.uc.r.appspot.com";
	port = "";
} else {
	baseURL = config.baseURL;
	port = config.serverPort;
}
var url = baseURL + port + "/spotify";
export default () => {
	return axios.create({
		baseURL: url,
	});
};