const MAGIC = '\x15\x02';

function frame(lat, lon) {
	// lon, lat
	const bbox = [
		[lon - 0.020272, lat - 0.01834],
		[lon + 0.020272, lat + 0.01834]
	];

	const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox[0][0]}%2C${bbox[0][1]}%2C${bbox[1][0]}%2C${bbox[1][1]}&amp;layer=mapnik&amp;marker=${lat}%2C${lon}`;
	document.getElementById('osm-map').src = src;
	document.getElementById('osm-map-a').href = `https://www.openstreetmap.org/?mlat=${lat}&amp;mlon=${lon}#map=16/${lat}/${lon}`;
	document.getElementById('osm-edit').href = `https://www.openstreetmap.org/edit#map=16/${lat}/${lon}`;
}

async function getClusterData(data, name) {
	let res = await fetch(`./data/${data}/clusters/${name}`);
	let text = await res.text();

	let rows = text.split('\n').map(r => {
		let [index, id] = r.split(MAGIC);
		return {index, id};
	});

	return rows;
}

async function displayClusterData(nodeId) {
	if (window.clusterCurrentItem == window.clusterItem) return;

	let res = await fetch(`https://api.openstreetmap.org/api/0.6/node/${nodeId}.json`);
	let data = await res.json();

	if (data.elements && data.elements.length) {
		let n = data.elements[0];

		if (n.version > 1) {
			alert('Node has been revised. (version > 1)');
		}

		document.getElementById('ename').value = n.tags.name;
		document.getElementById('lat').value = n.lat;
		document.getElementById('lon').value = n.lon;

		frame(n.lat, n.lon);
	} else {
		alert('Data not found');
	}

	window.clusterCurrentItem = window.clusterItem;
	document.getElementById('cname').innerText = window.clusterName;
	document.getElementById('cnum').innerText = '#' + window.clusterCurrentItem;
}

window.exploreCluster = async function(datasetName, clusterName) {
	document.getElementById('main').classList.toggle('huge');

	let res = await fetch('./page/clusterExplorer.html');
	let html = await res.text();

	document.getElementById('main').innerHTML = html;

	document.getElementById('prev').addEventListener('click', () => {
		window.clusterItem = Math.max(0, --window.clusterItem);
		displayClusterData(window.cluster[window.clusterItem].id);
	});
	document.getElementById('next').addEventListener('click', () => {
		window.clusterItem = Math.min(window.cluster.length - 1, ++window.clusterItem);
		displayClusterData(window.cluster[window.clusterItem].id);
	});

	window.clusterName = clusterName;
	window.clusterCurrentItem = -1;
	window.cluster = await getClusterData(datasetName, clusterName);
	window.clusterItem = 0;
	await displayClusterData(window.cluster[window.clusterItem].id);
};
