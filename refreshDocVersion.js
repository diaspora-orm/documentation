const fs = require('fs');
const semver = require('semver');
const { major, minor, patch } = semver;

const diasporaPath = '../diaspora';
const {version} = require(`${diasporaPath}/package.json`);
const doc = require(`${diasporaPath}/doc.json`);
fs.writeFileSync(`./src/assets/content/api/${major(version)}-${minor(version)}-${patch(version)}.json`, JSON.stringify(doc));
