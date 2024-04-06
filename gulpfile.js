const { src, dest, parallel } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const CleanCSS = require('clean-css');
const header = require('gulp-header');
const fs = require('fs');
const lightDark = require('./light-dark.json');

function minify() {
	return src(['themes/*.css', '!themes/base.css'])
		.pipe(header(fs.readFileSync('./themes/base.css', 'utf8')))
		.pipe(cleanCSS())
		.pipe(dest('dist/'));
}

function mergeLightDark() {
	const base = fs.readFileSync('./themes/base.css', 'utf8');
	const items = lightDark;

	const partials = [];

	items.forEach((data) => {
		partials.push(`
			<div>
				<div class="stack">
					<img src="${data.light.replace('.css', '.png')}">	
					<img src="${data.dark.replace('.css', '.png')}">	
				</div>
				<span>
					${data.name}<br>
					<span class="has-text-grey-dark">
						Light / Dark
					</span>
				</span>
			</div>
		`);
	});

	const html = partials.join('');
	fs.writeFileSync('light-dark-gallery.html', html);

	const clean = (theme) =>
		theme.replace(
			/(pre|code)\[class\*='language-'\]::-moz[^\{]+\{[^\}]+\}/,
			'',
		);

	items.forEach((data) => {
		const light = clean(fs.readFileSync(`./themes/${data.light}`, 'utf8'));
		const dark = clean(fs.readFileSync(`./themes/${data.dark}`, 'utf8'));

		const nestedDark = dark
			.replace(/(\n)([^\s\}@\/])/g, '$1& $2')
			.replace(/\:root/g, '');

		const combo = `
			${base}
			${light}
			html[class*="-dark"],
			html[class*="dark-"],
			.dark {
				${nestedDark}
			}
		`;

		const minified = new CleanCSS().minify(combo);
		const name = data.name.replace(/\s/g, '-').toLowerCase();

		fs.writeFileSync(
			`./dist/prism-${name}.light-dark.css`,
			minified.styles,
		);
	});

	return Promise.resolve();
}

exports.build = parallel(minify, mergeLightDark);
