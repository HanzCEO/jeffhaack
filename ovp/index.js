const qo = require('query-overpass');

module.exports = async function query(ql) {
	return new Promise((resolve, reject) => {
		qo(ql, (error, data) => {
			if (error) reject(error);
			resolve(data);
		});
	});
};
