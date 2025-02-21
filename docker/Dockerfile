# Dockerfile
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY app/package*.json ./
RUN npm install

# Copy the rest of the application code
COPY app .

EXPOSE 8080

# Start the app
CMD ["npm", "start"]
