const fsAsync = require('fs').promises;
const { src, dest, parallel } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const path = require('path');
const header = require('gulp-header');
const fs = require('fs');
const distDir = path.join(__dirname, 'dist');
const screenshotDir = path.join(__dirname, 'screenshots');

/**
 * Returns the names of all themes. This includes the `prism-` prefix.
 */
async function getThemes() {
	return (await fsAsync.readdir(distDir))
		.map((f) => (/^.+(?=\.css$)/.exec(f) || [''])[0])
		.filter((f) => f);
}

/**
 * Checks that all themes have a screenshot.
 */
async function checkScreenshots() {
	for (const theme of await getThemes()) {
		const file = `${screenshotDir}/${theme}.png`;
		if (
			!(await fsAsync
				.stat(file)
				.then((s) => s.isFile())
				.catch(() => false))
		) {
			throw new Error(`The theme "${theme}" doesn't have a screenshot.`);
		}
	}
}

/**
 * Checks that all themes are in the list of available themes.
 */
async function checkAvailableThemes() {
	const readme = await fsAsync.readFile(
		path.join(__dirname, 'README.md'),
		'utf-8',
	);

	for (const theme of await getThemes()) {
		if (!readme.includes(theme + '.css')) {
			throw new Error(
				`The theme "${theme}" is not included in the list of available themes.`,
			);
		}
		if (!readme.includes(theme + '.png')) {
			throw new Error(
				`The screenshot of "${theme}" is not included in the list of available themes.`,
			);
		}
	}
}

const ISSUE_RE = /#(\d+)(?![\d\]])/g;
const ISSUE_SUB =
	'[#$1](https://github.com/automadcms/automad-prism-themes/issues/$1)';
const CHANGELOG = 'CHANGELOG.md';

async function linkify() {
	let changelog = await fsAsync.readFile(CHANGELOG, 'utf-8');

	changelog = changelog.replace(ISSUE_RE, ISSUE_SUB);

	await fsAsync.writeFile(CHANGELOG, changelog, 'utf-8');
}

function minify() {
	return src(['themes/*.css', '!themes/base.css'])
		.pipe(header(fs.readFileSync('./themes/base.css', 'utf8')))
		.pipe(cleanCSS())
		.pipe(dest('dist/'));
}

exports.check = parallel(checkScreenshots, checkAvailableThemes);
exports.linkify = linkify;
exports.minify = minify;
