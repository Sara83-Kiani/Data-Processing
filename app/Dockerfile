FROM node:20

WORKDIR /usr/src/app

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy package.json first for caching
COPY package*.json ./

RUN npm install

# Copy the rest of the code and build
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
