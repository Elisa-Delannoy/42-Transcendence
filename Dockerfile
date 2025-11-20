FROM node:20

WORKDIR /docker

COPY package.json ./

RUN npm install -g ts-node typescript 
RUN npm install 
RUN npm init

COPY . .

CMD ["npm", "run front"]