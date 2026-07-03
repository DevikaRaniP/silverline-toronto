# Use official Node.js lightweight image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy remaining source code
COPY . .

# Expose the default GCP environment port (8080)
EXPOSE 8080

# Start the Express server
CMD ["npm", "start"]
