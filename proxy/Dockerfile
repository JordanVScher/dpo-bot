FROM node:11.13.0

WORKDIR /home/node/app_df

COPY . .
RUN npm i

EXPOSE 1992

CMD ["npm", "run", "start:proxy"]
