# Gotta make sure we are in the correct dir
cd /root/imgs-v2/Backend-V2

echo "Pulling new repo..."
git pull

echo "Building new docker container..."
docker build . -t imgs-bar/api

echo "Stopping Container..."
docker stop Beta-API

echo "Removing Container..."
docker rm Beta-API

echo "Starting new container..."
docker run -d --name "Beta-API" -p 127.0.0.1:8080:8080 imgs-bar/api
