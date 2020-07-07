FROM node:14.4.0

WORKDIR /home/node/app_browser/build

COPY . .

EXPOSE 1991

RUN npm install react-scripts
RUN npm run build
# CMD ["npm", "run", "build"]


# RUN npm install -g serve
# CMD ["serve", "-p", "1991", "-s", "."]