FROM node:20

RUN apt-get update && apt-get install -y sqlite3 && apt-get clean

WORKDIR /app

COPY package.json package-lock.json ./
 
RUN npm ci

COPY . .

EXPOSE 8443

CMD ["npm", "run", "back"]