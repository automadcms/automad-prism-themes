#!/bin/bash

file="public/index.html"

mkdir public 2>/dev/null

gallery=''

for png in screenshots/prism-*.png; do
	theme=$(basename -- $png .png)

	name=${theme/prism-/}
	name=${name//-/ }
	name=($name)
	name="${name[@]^}"

	read -r -d '' item <<-EOF
		<a
			href="https://github.com/automadcms/automad-prism-themes/blob/master/themes/${theme}.css" 
			class="cell"
			target="_blank"
		>
			<img src="${theme}.png">
			<div class="has-text-text">${name}</div>
		</a>
	EOF

	gallery="${gallery}\n${item}"

	cp $png "public/${theme}.png" 2>/dev/null
done

html=$(<screenshots/gallery-template.html)
lightDark=$(<light-dark-gallery.html)

html="${html/__LIGHT_DARK__/$lightDark}"

echo -e "${html/__THEMES__/$gallery}" >$file
