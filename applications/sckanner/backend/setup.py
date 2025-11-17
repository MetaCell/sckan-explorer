# coding: utf-8

import sys

from setuptools import find_packages, setup

NAME = "sckanner"
VERSION = "3.0.1"

# To install the library, run the following
#
# python setup.py install
#
# prerequisite: setuptools
# http://pypi.python.org/pypi/setuptools

REQUIRES = [
]

setup(
    name=NAME,
    version=VERSION,
    description="sckanner",
    author_email="developers@metacell.us",
    url="",
    keywords=["OpenAPI", "sckanner"],
    install_requires=REQUIRES,
    packages=find_packages(),
    include_package_data=True,
    long_description="sckanner",
)
