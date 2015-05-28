"""
	Adds a md5 filter for all jinja2 templates
"""
def geotagx_md5(s):
	import hashlib
	return hashlib.md5(s).hexdigest()