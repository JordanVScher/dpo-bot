FROM node:11.13.0

WORKDIR /home/node/app

COPY . .
RUN npm install

EXPOSE 1990

COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

