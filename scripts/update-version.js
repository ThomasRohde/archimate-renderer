const fs = require('fs');
const path = require('path');

// Read the version from package.json
const packageJson = require('../package.json');
const version = packageJson.version;

// Create or update the version.ts file
const versionFilePath = path.join(__dirname, '../src/version.ts');
const content = `/**
 * This file is auto-generated during the build process.
 * Do not modify this file directly as it will be overwritten.
 */
export const VERSION = '${version}';
`;

fs.writeFileSync(versionFilePath, content, 'utf8');
console.log(`Version file updated with version ${version}`);
