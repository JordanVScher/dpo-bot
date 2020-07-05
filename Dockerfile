FROM node:14.4.0

WORKDIR /home/node/app

COPY . .
RUN npm i 

EXPOSE 1992

CMD ["npm", "run", "start:bottender"]

