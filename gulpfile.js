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
	const minify = (theme) => {
		const cleaned = theme.replace(
			/(pre|code)\[class\*='language-'\]::-moz[^\{]+\{[^\}]+\}/s,
			'',
		);

		return new CleanCSS().minify(cleaned).styles;
	};

	const nestAndMinify = (theme) => {
		const temp = theme
			.replace(/(\n)([^\s\}@\/])/g, '$1.TEMP__NEST $2')
			.replace(/\:root/g, '');

		return minify(temp).replace(/\.TEMP__NEST/g, '&');
	};

	const base = minify(fs.readFileSync('./themes/base.css', 'utf8'));
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

	items.forEach((data) => {
		const light = minify(fs.readFileSync(`./themes/${data.light}`, 'utf8'));
		const nestedDark = nestAndMinify(
			fs.readFileSync(`./themes/${data.dark}`, 'utf8'),
		);
		const name = data.name.replace(/\s/g, '-').toLowerCase();
		const combo = `${base}${light}html[class*="-dark"],html[class*="dark-"],.dark{${nestedDark}}`;

		fs.writeFileSync(`./dist/prism-${name}.light-dark.css`, combo);
	});

	return Promise.resolve();
}

exports.build = parallel(minify, mergeLightDark);
