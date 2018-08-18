const fs = require('fs');

const diasporaPath = '../diaspora';
const {version} = require(`${diasporaPath}/package.json`);
const doc = require(`${diasporaPath}/doc.json`);
fs.writeFileSync(`./src/assets/content/api/${version}.json`, JSON.stringify(doc));
