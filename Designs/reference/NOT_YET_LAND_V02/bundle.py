from pathlib import Path
from base64 import b64encode
import re, json
root=Path(__file__).parent
html=(root/'index.html').read_text();css=(root/'style.css').read_text();js=(root/'app.js').read_text()
data={}
for p in (root/'assets').iterdir():
 if p.suffix.lower() in ('.svg','.webp','.png','.jpg'):
  mime={'.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'}[p.suffix]
  data[p.stem]=f'data:{mime};base64,'+b64encode(p.read_bytes()).decode()
# replace CSS literal asset URLs
for key,val in data.items():
 for extension in ('.svg','.webp','.png','.jpg'):
  css=css.replace(f'assets/{key}{extension}',val)
# replace generated image strings in JS via data map
js=js.replace("const src=s=>`assets/${s}.webp`;const terrain=s=>`assets/${s}_terrain.svg`;", "const src=s=>ASSETS[s];const terrain=s=>ASSETS[s+'_terrain'];")
js=js.replace('src="assets/world.svg"', 'src="${ASSETS.world}"')
js=js.replace('src="assets/st-helens.webp"','src="${ASSETS[\'st-helens\']}"')
js=js.replace('src="assets/st-helens-detail.webp"','src="${ASSETS[\'st-helens-detail\']}"')
js="const ASSETS="+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n'+js
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="app.js"></script>','<script>'+js+'</script>')
(root/'standalone.html').write_text(html)
print('Bundle KB',len(html)//1024,'Assets',len(data))
