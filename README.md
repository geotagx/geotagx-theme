# GeoTag-X Theme

This is the theme used by the [GeoTag-X project](https://geotagx.org).


## Requirements

Prior to installing this theme, the [GeoTag-X PyBossa plugin](https://github.com/geotagx/pybossa-plugin-geotagx) must have already been installed.


## Installing the theme

Installation is as simple as copying the theme's folder to PyBossa's custom
theme directory usually located at `<path/to/pybossa>/pybossa/themes/` where
`<path/to/pybossa>` is the location of your PyBossa installation.

Once the theme has been copied, change PyBossa's `THEME` setting to match
the name of the theme's folder. For instance, if the theme is now located
at  `<path/to/pybossa>/pybossa/themes/geotagx-theme/`, edit or add

```python
THEME = "geotagx-theme"
```

to `<path/to/pybossa>/settings_local.py` where `<path/to/pybossa>` is the
location of your PyBossa installation.


## Getting Involved

Have you noticed a bug in our code? Do you think we can improve this project?
Learn how to [**contribute to this project**](CONTRIBUTING.md)!
