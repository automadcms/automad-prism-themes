import captureWebsite from 'capture-website';
import * as fs from 'fs/promises';

const themesDir = './themes';
const screenshotDir = './screenshots';

/**
 * Returns the names of all themes. This includes the `prism-` prefix.
 */
async function getThemes() {
	return (await fs.readdir(themesDir))
		.map((f) => (/^prism.+(?=\.css$)/.exec(f) || [''])[0])
		.filter((f) => !f.match(/prism-base/))
		.filter((f) => f);
}

/**
 * Takes a screenshot of themes which don't have one already.
 */
async function screenshotMissingThemes() {
	for (const theme of await getThemes()) {
		await screenshotTheme(theme, false);
	}
}

/**
 * Takes a screenshot of the given themes and saves the image file in the screenshot directory.
 *
 * __IMPORTANT:__ Screenshots have to be taken sequentially, one after an other, to prevent a memory leak.
 *
 * @param {string} theme
 * @param {boolean} overwrite
 */
async function screenshotTheme(theme, overwrite) {
	const file = `${screenshotDir}/${theme}.png`;

	if (
		await fs
			.stat(file)
			.then((s) => s.isFile())
			.catch(() => false)
	) {
		if (overwrite) {
			await fs.unlink(file);
		} else {
			return;
		}
	}

	console.log(`Generating screenshot for ${theme}`);

	await captureWebsite.file(screenshotDir + '/code.html', file, {
		defaultBackground: false,
		scaleFactor: 1,
		element: 'pre',
		styles: [
			await fs.readFile(`${themesDir}/base.css`, 'utf-8'),
			await fs.readFile(`${themesDir}/${theme}.css`, 'utf-8'),
		],
	});
}

screenshotMissingThemes();
