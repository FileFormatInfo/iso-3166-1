#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type SearchEntry = {
	alpha_3: string;
	alpha_3_b: string;
	alpha_3_t: string;
	alpha_2: string;
	name_ref: string;
	comment?: string;
	tags: string[];
	parent?: string;
	children?: string[];
	active: boolean;
};

type SearchData = {
	success: boolean;
	lastmod: string;
	data: SearchEntry[];
}

const scopeMap: { [key:string]:string } = {
	'I': 'Individual',
	'M': 'Macrolanguage',
	'S': 'Special',
};

const typeMap: { [key:string]:string } = {
	'A': 'Ancient',
	'C': 'Constructed',
	'E': 'Extinct',
	'H': 'Historical',
	'L': 'Living',
	'S': 'Special',
};

const entryMap: { [key:string]:SearchEntry } = {};

async function main() {
	console.log(`INFO: starting at ${new Date().toISOString()}`);

	const namePath = path.join( __dirname, '..', 'tmp', 'iso-639-3_Name_Index.tab' );
	const retirePath = path.join( __dirname, '..', 'tmp', 'iso-639-3_Retirements.tab' );
	const macroPath = path.join( __dirname, '..', 'tmp', 'iso-639-3-macrolanguages.tab' );
	const corePath = path.join( __dirname, '..', 'tmp', 'iso-639-3.tab' );
	const jsonPath = path.join( __dirname, '..', 'public', 'iso-639-3.json' );

	try {
		await fs.access(corePath);
	} catch (err) {
		console.log(`INFO: core data file does not exist in ${corePath}`);
		process.exit(1);
	}

	console.log(`INFO: reading core data file from ${corePath}`);
	const coreData = (await fs.readFile(corePath, 'utf-8')).trim();

	const lines = coreData.split(/\r?\n/).slice(1);
	for (const line of lines) {
		// console.log(`LINE: ${line}`);
		if (line.length == 0) {
			continue;
		}
		if (line.startsWith('#')) {
			continue;
		}

		const parts = line.split('\t');
		if (parts.length < 7 || parts.length > 8) {
			console.log(`WARN: unexpected number of parts (${parts.length}) for line: ${line}`);
			continue;
		}

		const tags = [ scopeMap[parts[4]] || parts[4] ]
		const second_tag = typeMap[parts[5]] || parts[5];
		if (tags[0] !== second_tag) {
			tags.push( second_tag );
		}

		entryMap[parts[0]] = {
			alpha_3: parts[0],
			alpha_3_b: parts[1],
			alpha_3_t: parts[2],
			alpha_2: parts[3],
			tags,
			name_ref: parts[6],
			comment: (parts.length == 8 && parts[7].length > 0) ? parts[7] : undefined,
			active: true,
		};
	}
	try {
		await fs.access(macroPath);
	} catch (err) {
		console.log(`INFO: macro data file does not exist in ${macroPath}`);
		process.exit(1);
	}

	console.log(`INFO: reading macro data file from ${macroPath}`);
	const macroData = (await fs.readFile(macroPath, "utf-8")).trim();
	const macroLines = macroData.split(/\r?\n/).slice(1);
	for (const line of macroLines) {
		if (line.length == 0) {
			continue;
		}
		if (line.startsWith('#')) {
			continue;
		}

		const parts = line.split('\t');
		if (parts.length != 3) {
			console.log(`WARN: unexpected number of parts (${parts.length}) for line: ${line}`);
			continue;
		}
		if (parts[2] === 'R') {
			// retired macrolanguage, skip
			continue;
		}

		const parentEntry = entryMap[parts[0]];
		if (!parentEntry) {
			console.log(`WARN: parent entry not found for macrolanguage code: ${parts[0]}`);
			continue;
		}
		if (!parentEntry.children) {
			parentEntry.children = [];
		}
		parentEntry.children.push(parts[1]);

		const childEntry = entryMap[parts[1]];
		if (!childEntry) {
			console.log(`WARN: child entry not found for macrolanguage code: ${parts[1]}`);
			continue;
		}
		if (childEntry.parent) {
			console.log(`WARN: child entry ${parts[1]} already has parent ${childEntry.parent}, cannot set to ${parts[0]}`);
			continue;
		}
		childEntry.parent = parts[0];
	}

	const data = Object.values(entryMap);
	data.sort( (a, b) => a.alpha_3.localeCompare(b.alpha_3) );

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
