"""
	Adds a md5 filter for all jinja2 templates
"""
def geotagx_md5(s):
	import hashlib
	return hashlib.md5(s).hexdigest()

def geotagx_blog_image(body, default_image):
	# Note : The body is supposed to be in MarkDown
	import re
	links = re.findall('!\[.*\]\((.*)\)', body)
	if len(links) == 0:
		return default_image
	else:
		# Return the first image link if there are indeed multiple images in the body
		return links[0]

def geotagx_blog_trim_body(body):
	CHARACTERS_IN_SHORT_DESCRIPTION = 400
	if len(body) < CHARACTERS_IN_SHORT_DESCRIPTION :
		return body
	else:
		return body[:CHARACTERS_IN_SHORT_DESCRIPTION]+"..."

def geotagx_remove_images_from_markdown(body):
	import re
	links = re.findall('(!\[.*\]\(.*\))', body)
	for _link in links:
		body = body.replace(_link, '')
	return body
