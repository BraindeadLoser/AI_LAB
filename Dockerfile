FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose port if needed (Electron apps often use 3000 for dev)
EXPOSE 3000

# Run Electron app
CMD ["npm", "start"]
