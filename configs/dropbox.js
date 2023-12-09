const axios = require('axios');
const { Dropbox } = require('dropbox');
const { v4: uuid } = require('uuid');

module.exports.getRefreshAndAccessToken = async (req, res) => {
	try {
		const url = 'https://api.dropbox.com/oauth2/token';
		const body = new URLSearchParams({
			'code': process.env.DROPBOX_GRANT_CODE,
			'grant_type': 'authorization_code'
		});
		const configs = {
			auth: {
				username: process.env.DROPBOX_APP_KEY,
				password: process.env.DROPBOX_APP_SECRET
			}
		};
		await axios.post(url, body, configs)
			.then(dropboxRes => console.log(dropboxRes.data))
			.catch(err => console.error(err.response.data));
	} catch (error) {
		res.send(JSON.stringify(error));
	}
};

module.exports.getAccessToken = async () => {
	try {
		const url = 'https://api.dropbox.com/oauth2/token';
		const body = new URLSearchParams({
			'refresh_token': process.env.DROPBOX_REFRESH_TOKEN,
			'grant_type': 'refresh_token',
			'client_id': process.env.DROPBOX_APP_KEY,
			'client_secret': process.env.DROPBOX_APP_SECRET
		});
		return axios.post(url, body);
	} catch (error) {
		console.log(error);
		return undefined;
	}
};

module.exports.loadImageFromId = async (id) => {
	let dropboxAccessToken;
	await this.getAccessToken()
		.then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

	var dbx = new Dropbox({ accessToken: dropboxAccessToken });
	return await dbx.filesDownload({ path: id });
};

module.exports.updateImage = async (id, content) => {
	let result, error;
	if (!content) return;
	let dropboxAccessToken;
	await this.getAccessToken()
		.then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

	var dbx = new Dropbox({ accessToken: dropboxAccessToken });
	await dbx.filesUpload({
		path: id,
		contents: content,
		mode: 'overwrite'
	})
		.then(dRes => result = dRes.result)
		.catch(err => error = err);
	return { error, result };
};

module.exports.uploadImage = async (content) => {
	if (!content) return;
	let dropboxAccessToken;
	await this.getAccessToken()
		.then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

	var dbx = new Dropbox({ accessToken: dropboxAccessToken });
	const upload = await dbx.filesUpload({
		path: `/avatars/${uuid()}.png`,
		contents: content
	});
	const pictureId = upload.result.id;
	const pictureUrl = await this.createSharedLink(pictureId);
	return { pictureId, pictureUrl };
};

module.exports.deleteImageById = async (id) => {
	let dropboxAccessToken;
	await this.getAccessToken()
		.then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

	var dbx = new Dropbox({ accessToken: dropboxAccessToken });
	return await dbx.filesDeleteV2({
		path: id
	});
};

module.exports.getSharedLink = async (id) => {
	let dropboxAccessToken;
	await this.getAccessToken()
		.then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

	const url = 'https://api.dropboxapi.com/2/sharing/list_shared_links';
	const body = {
		path: id
	};
	const configs = {
		headers: {
			Authorization: `Bearer ${dropboxAccessToken}`
		}
	};
	return await axios.post(url, body, configs);
};

module.exports.createSharedLink = async (id) => {
	let dropboxAccessToken;
	await this.getAccessToken()
		.then(dropboxRes => dropboxAccessToken = dropboxRes.data.access_token);

	const url = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
	const body = {
		path: id,
		settings: {
			access: 'viewer',
			allow_download: true,
			audience: 'public',
			requested_visibility: 'public'
		}
	};
	const configs = {
		headers: {
			Authorization: `Bearer ${dropboxAccessToken}`,
			'Content-Type': 'application/json'
		}
	};

	const getSharedLink = await axios.post(url, body, configs);
	return getSharedLink.data.url.replace('www.dropbox', 'dl.dropboxusercontent');
};