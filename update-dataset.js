const fs = require('fs');

const axios = require('axios');
const qo = require('./ovp');
const { XMLParser } = require('fast-xml-parser');

const MAGIC_SEP = '\x15\x02';

//qo('[bbox:-9.5635008,100.0506869,3.4517476,125.6458452][out:json][timeout:25];node(user:"jeffhaack")(if:changeset()==8316792);out;', (e, d) => {
async function qnodes(nodes) {
	// TODO: Should've setup my own provider
//	let res = await qo(`[out:json][timeout:25];node(id:${nodes.join(",")});out;`);
	let res = await axios(`https://www.openstreetmap.org/api/0.6/nodes.json?nodes=${nodes.join(",")}`);
	return res.data.elements;
}

function initXMLParser() {
	const option = { ignoreAttributes: false, attributeNamePrefix : "" };
	return new XMLParser(option);
}

function batch(array, n) {
	let a = [];
	for (let i = 0; i < n; i++) {
		let shift = array.shift();
		if (shift === undefined) break;

		a.push(shift);
	}

	return a;
}

function saveRow(ws, index, node) {
	let row = [index, node.id];
	ws.write(`${row.join(MAGIC_SEP)}\n`);
}

function getProgress(file) {
	// TODO: Optimize this
	let s = fs.readFileSync(file).toString();
	let ss = s.split('\n');

	// Remove excess newline
	ss.pop();

	let lateIndex = Number(ss[ss.length - 1]?.split(MAGIC_SEP)[0]);

	if (isNaN(lateIndex)) return 0;

	return Math.max(0, lateIndex);
}

async function main() {
	const argv = process.argv.slice(2);

	console.log("[*] Reading", argv[0]);
	const source = fs.readFileSync(argv[0]);
	const ws = fs.createWriteStream(argv[1], { flags: 'a' });

	console.log("[*] Parsing XML");
	const xjson = initXMLParser().parse(source);
	const changes = xjson.osmChange;

	// Getting node ids
	let nids = changes.create.map(c => c.node.id);

	const batchSize = 10;
	let bt = [];
	let ind = getProgress(argv[1]);

	if (ind > 0) {
		console.log("[i] Resuming progress from index", ind);
		// Array.slice(truncate_n_first_elem)
		nids = nids.slice(ind + 1);
	}

	do {
		bt = batch(nids, batchSize);
		console.log("[*] Query", ind);

		let nodes = await qnodes(bt);
		for (let i = 0; i < batchSize; i++) {
			let n = nodes[i];
			if (n === undefined) break;

			// Our filter is nodes that are initial
			if (n.version > 1) continue;

			saveRow(ws, ind + i, n);
		}

		ind += batchSize;
	} while (bt.length == batchSize);
}
main()
