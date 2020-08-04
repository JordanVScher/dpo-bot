FROM node:14.4.0

WORKDIR /home/node/app_browser/

COPY package.json package-lock.json* ./

RUN npm install && npm cache clean --force
RUN npm i react-scripts

COPY . .

EXPOSE 1991

RUN npx react-scripts build

RUN npm install -g serve
CMD ["npx", "serve", "build", "-p", "1991"]
