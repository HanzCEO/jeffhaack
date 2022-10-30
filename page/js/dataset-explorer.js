const alph = 'abcdefghijklmnopqrstuvwxyz';

const datasetClusters = {
	'id-village-name': 'xfs'
};

function alphCount(now, offset) {
	let group = now[1];
	let row = now[2];

	let newLevel = alph.indexOf(group);
	let newPlace = alph.indexOf(row) + offset;
	if (newPlace >= alph.length) {
		newLevel += Math.floor(newPlace / alph.length);
		newPlace = newPlace % alph.length;
	}

	return 'x' + alph[newLevel] + alph[newPlace];
}

function getDatasetClusters(name) {
	let ends = datasetClusters[name];
	let clusters = [];

	let al = 'xaa';

	do {
		clusters.push(al);
		al = alphCount(al, 1);
	} while (al != ends);

	// Add last entry
	clusters.push(al);

	return clusters;
}

function showClusters(datasetName, clusters) {
	let grid = document.getElementById('data-grid');
	grid.innerHTML = '';

	for (const c of clusters) {
		let card = document.createElement('div');
		card.classList.toggle('dataset-card');

		let icon = document.createElement('div');
		icon.classList.toggle('dataset-icon');

		let detail = document.createElement('div');
		detail.classList.toggle('dataset-detail');

		let span = document.createElement('span');
		span.innerText = c;

		let a = document.createElement('a');
		a.classList.toggle('button');
		a.href = `#cluster-${datasetName}#${c}`;
		a.innerText = 'Explore';

		detail.appendChild(span);
		detail.appendChild(a);

		card.appendChild(icon);
		card.appendChild(detail);

		grid.appendChild(card);
	}
}

window.addEventListener('hashchange', ({ newURL, oldURL }) => {
	const hash = location.hash.substr(1);
	if (hash.startsWith('dataset-')) {
		const datasetName = hash.substr(8);
		showClusters(datasetName, getDatasetClusters(datasetName));
	} else if (hash.startsWith('cluster-')) {
		const [ datasetName, clusterName ] = hash.substr(8).split('#');
		window.exploreCluster(datasetName, clusterName);
	}
});
