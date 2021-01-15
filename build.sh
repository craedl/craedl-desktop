#!/bin/bash
VERSION='0.1.0'
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
mv -v ./dist/main ../assets/exe/main
shopt -s extglob
rm -rfv !(main.py)
shopt -u extglob
cd ../..
npm run package:${1}
cd ./packages
for i in */; do
    if [ ${i%/} == $1 ]; then
        continue
    fi
    zip -rv ${i%/}-${VERSION}.zip $i
    IFS='-' read -a arch <<< ${i%/}
    mkdir -pv $1/${arch[-1]}
    mv -v ${i%/}-${VERSION}.zip $1/${arch[-1]}/${i%/}-${VERSION}.zip
    rm -rfv $i
done