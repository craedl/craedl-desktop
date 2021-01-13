#!/bin/bash
if [ $# -ne 1 ]; then
    echo 'Usage: ./build.sh os_type'
    exit 1
fi
if [ $1 != 'win' ] && [ $1 != 'linux' ] && [ $1 != 'osx' ]; then
    echo 'Accepted os_types: "win", "linux", "osx"'
    exit 1
fi
cd ./src/python
pyinstaller main.py --onefile
mv ./dist/main ../assets/exe/main
shopt -s extglob
rm -rfv !('main.py')
shopt -u extglob
cd ../..
npm run package:${1}
