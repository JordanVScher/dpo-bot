$ docker run \
    -it \
    --rm \
    -v ${PWD}:/app \
    -v /app/node_modules \
    -p 3500:3000 \
    -e CHOKIDAR_USEPOLLING=true \
    appcivico/dpo-browser