FROM node:14.15.1-alpine

WORKDIR senlife
COPY package.json .

RUN npm install
COPY . .



CMD ["npm", "run", "start"]
