FROM node:20-alpine

WORKDIR /usr/src/app

# Install deps first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest
COPY . .

EXPOSE 5173

# Run Vite dev server for browser testing
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
