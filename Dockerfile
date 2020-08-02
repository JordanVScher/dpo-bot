FROM node:14.4.0

WORKDIR /home/node/app_browser/

COPY . .

EXPOSE 1991

RUN npm i
RUN npm i react-scripts
RUN npx react-scripts build

RUN npm install -g serve
CMD ["npx", "serve", "build", "-p", "1991"]
