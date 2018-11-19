import { writeFileSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import compareVersions from 'compare-versions';

const diasporaPath = '../diaspora';
const docPath = './src/assets/content/api';
const environmentPath = './src/environments';

try{
	const {version} = require(`${diasporaPath}/package.json`);
	const doc = require(`${diasporaPath}/doc.json`);
	writeFileSync(`${docPath}/${version}.json`, JSON.stringify(doc));

	const docFiles = readdirSync(docPath);
	const matcher = /(\/\*\s*<doc-versions>\s*\*\/)(.*?)(\/\*\s*<\/doc-versions>\s*\*\/)/;
	const docFilesJson = JSON.stringify(docFiles.map(version => version.replace('.json', '')).sort(compareVersions).reverse()).replace(/"/g, "'");

	readdirSync(environmentPath).forEach(file => {
		const envFileContent = readFileSync(join(environmentPath, file), 'UTF-8');
		const match = envFileContent.match(matcher);
		if(match){
			console.info(`Updating env file ${file}`);
			const replacedEnvFileContent = envFileContent.replace(match[0], `${match[1]}${docFilesJson}${match[3]}`);
			writeFileSync(join(environmentPath, file), replacedEnvFileContent);
		} else {
			console.warn(`Env file ${file} did not match any replacement tag`);
		}
	});
} catch (e){
	console.log('No valid local diaspora package, abort', e);
}
