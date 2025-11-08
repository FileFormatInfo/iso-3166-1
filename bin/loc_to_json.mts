#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type SearchEntry = {
	alpha_3_b: string;
	alpha_3_t: string;
	alpha_2: string;
	name_en: string;
	name_fr: string;
}

type SearchData = {
	success: boolean;
	lastmod: string;
	data: SearchEntry[];
}

async function main() {
	console.log(`INFO: starting at ${new Date().toISOString()}`);

	const txtPath = path.join( __dirname, '..', 'tmp', 'iso-639-2.txt' );
	const jsonPath = path.join( __dirname, '..', 'public', 'iso-639-2.json' );

	try {
		await fs.access(txtPath);
	} catch (err) {
		console.log(`INFO: txt file does not exist in ${txtPath}`);
		process.exit(1);
	}

	// Read and parse the XML file
	console.log(`INFO: reading XML file from ${txtPath}`);
	const txtData = (await fs.readFile(txtPath, 'utf-8')).trim();

	const data: SearchEntry[] = [];

	const lines = txtData.split(/\r?\n/);
	for (const line of lines) {
		// console.log(`LINE: ${line}`);
		if (line.length == 0) {
			continue;
		}
		if (line.startsWith('#')) {
			continue;
		}

		const parts = line.split('|');
		if (parts.length < 4) {
			console.log(`WARN: unexpected number of parts (${parts.length}) for line: ${line}`);
			continue;
		}

		data.push({
			alpha_3_b: parts[0],
			alpha_3_t: parts[1],
			alpha_2: parts[2],
			name_en: parts[3],
			name_fr: parts[4],
		});
	}

	const output: SearchData = {
		success: true,
		lastmod: new Date().toISOString(),
		data,
	};

	// Write the JSON data to a file
	console.log(`INFO: writing ${data.length} items to ${jsonPath}`);
	await fs.writeFile(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
	console.log(`INFO: wrote JSON data to ${jsonPath}`);
}



main().then( () => {
	console.log(`INFO: complete at ${new Date().toISOString()}`);
});
