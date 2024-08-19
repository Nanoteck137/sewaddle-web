#!/usr/bin/env python3

import os
import urllib.request
import subprocess
import shutil

def fetch_pyrin_conf(version: str) -> str:
    url = 'https://raw.githubusercontent.com/Nanoteck137/sewaddle/v{}/misc/pyrin.json'.format(version)
    res = ''
    with urllib.request.urlopen(url) as req:
        res = req.read().decode('utf-8')

    return res

data = ''
with open('version', 'r') as file:
    data = file.read()

splits = data.split('-')
api_version = splits[0]
revision = splits[1]

pyrin = fetch_pyrin_conf(api_version)

os.mkdir("tmp")

with open("./tmp/pyrin.json", "w") as file:
    file.write(pyrin)

subprocess.run(["pyrin", "ts", "./tmp/pyrin.json", "-o", "./src/lib/api/"])
with open("./src/lib/api/api-version", "w") as file:
    file.write(api_version)

shutil.rmtree("tmp")