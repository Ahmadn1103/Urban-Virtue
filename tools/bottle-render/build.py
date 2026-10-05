"""Copy the measured liquid geometry (geo.json, from post.py) into the hero script."""
import json, os, re

D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(D))
geo = json.load(open(os.path.join(D, 'geo.json')))
geo = {k: (round(v, 4) if isinstance(v, float) else v) for k, v in geo.items() if k != 'bg'}
path = os.path.join(ROOT, 'components', 'hero', 'blend.js')
js = open(path).read()
js = re.sub(r'/\*GEO\*/\{[^;]*\}', '/*GEO*/' + json.dumps(geo), js)
open(path, 'w').write(js)
print('updated', path)
