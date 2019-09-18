FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y netcat

COPY . .

EXPOSE 3002

CMD ["npm", "start"]
