#!/bin/bash
#
# This script is part of the GeoTag-X theme project.
# https://github.com/geotagx/geotagx-theme
#
# Author: Jeremy Othieno (j.othieno@gmail.com)
#
# Copyright (c) 2017 UNITAR/UNOSAT
#
# The MIT License (MIT)
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
# DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
# OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
# OR OTHER DEALINGS IN THE SOFTWARE.
set -e
set -o pipefail

NPM=$(type -P npm)
if [ ! -x "$NPM" ]
then
	echo "Error! Could not find the 'npm' executable. Please make sure it's installed, in your PATH, and executable."
	exit 1
fi

GRUNT=$(type -P grunt)
if [ ! -x "$GRUNT" ]
then
	echo "Error! Could not find the 'grunt' executable. Please make sure it's installed, in your PATH, and executable."
	exit 1
fi

BASE_DIR="$(readlink -f $0 | xargs realpath | xargs dirname | xargs dirname)"
STATIC_DIR="$BASE_DIR/static"

# Install depedencies and build the static files.
"$NPM" --prefix "$STATIC_DIR" install
"$GRUNT" --base "$STATIC_DIR" --gruntfile "$STATIC_DIR/Gruntfile.js"

exit 0
