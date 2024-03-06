var express = require('express');
var router = express.Router();

// const axios = require('axios');
// const fs = require('fs');

router.get('/', async (req, res) => {
	const cookie = req.headers.cookie.split(';').reduce((result, e) => {
		const [key, value] = e.split('=');
		result[key] = value;
		return result;
	}, {});
	console.log(cookie)
	
	res.send(`
	<h3 style="text-align: center;">🎉 🎉 🎉 server alive 🎉 🎉 🎉</h3>
	<div style="position: absolute;bottom:5px; width: 100%; text-align:center">
	&copy; copyright by jiathinhj
	</div>
	`);
});

module.exports = router;
