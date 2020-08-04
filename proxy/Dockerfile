FROM node:14.4.0

WORKDIR /home/node/dpo_proxy_app/proxy

COPY package.json package-lock.json* ./

RUN npm install && npm cache clean --force

COPY . .

# EXPOSE 1992

CMD ["node", "server.js"]
