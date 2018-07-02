#!/bin/bash

for i
do
    echo "creating project $i"
done

git clone git@github.com:AnnatarHe/webpack-template.git $i

cd $i

rm -rf .git
