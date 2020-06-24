FROM node:11.13.0

WORKDIR /home/node/app

COPY . .
RUN npm i 

EXPOSE 1990

CMD ["npm", "run", "start:bottender"]

