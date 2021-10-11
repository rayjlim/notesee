#!/bin/bash

. ./env_vars.sh

if [ -z "$FTP_HOST" ]; then
    echo "Missing env_vars"
    exit 2
fi

echo "FTP HOST " $FTP_HOST

while getopts rbf option; do
  case "${option}" in
    r) RESETSSH=true;;
    b) SKIP_BUILD_BE=true;;
    f) SKIP_BUILD_FE=true;;
  esac
done

if [ -z $SKIP_BUILD_BE ]; then
  mkdir -p ../../$PREP_DIR-api
  cd ../backend
  rsync -ravz --exclude-from '../scripts/be_production-exclude.txt' --delete . ../$PREP_DIR-api
  rsync -avz  ../scripts/be_production-exclude-push.txt ../$PREP_DIR-api/be_production-exclude-push.txt
  rsync -avz  config/config.php.production ../$PREP_DIR-api/config.php
  pwd
  cd ../$PREP_DIR-api
  /usr/local/bin/composer update
  /usr/local/bin/composer install  --no-dev
  chmod 755 *.php
  
  echo "Backend build ready"
  cd ../notesee
else
  echo "Skip Backend Build"
  cd ../
fi

if [ -z "$SKIP_BUILD_FE" ]; then
  mkdir -p ../$PREP_DIR-ui
  cd frontend
  npm run build
  buildresult=$?
  if [ $buildresult != 0 ]; then
    echo "SPA Build Fail"
    exit 1
  fi
  
  rsync -ravz build/* ../$PREP_DIR-ui/
  cd ..
else
  echo "Skip Frontend Build"
fi

echo "start upload"

# setup passwordless ssh
if [ ! -z $RESETSSH ]; then
    echo "Reset ssh key"
    ssh-keygen -f $KEY_DIR -R $FTP_HOST
    ssh-copy-id -f -i ~/.ssh/id_rsa -oHostKeyAlgorithms=+ssh-dss $FTP_USER@$FTP_HOST
else
    echo "Skip SSH Reset"
fi

cd ./$PREP_DIR-api
pwd
echo $FTP_TARGETFOLDER_API
rsync -rave  'ssh -oHostKeyAlgorithms=+ssh-dss' \
  --exclude-from 'be_production-exclude-push.txt' \
  --delete . $FTP_USER@$FTP_HOST:$FTP_TARGETFOLDER_API/

cd ./$PREP_DIR-ui
pwd
echo $FTP_TARGETFOLDER_UI
rsync -rave  'ssh -oHostKeyAlgorithms=+ssh-dss' \
  --delete . $FTP_USER@$FTP_HOST:$FTP_TARGETFOLDER_UI/

ssh  $FTP_USER@$FTP_HOST "chmod -R 755 $FTP_TARGETFOLDER_API/"
ssh  $FTP_USER@$FTP_HOST "chmod -R 755 $FTP_TARGETFOLDER_UI/"