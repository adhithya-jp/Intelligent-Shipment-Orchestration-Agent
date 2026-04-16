FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the Vite port
EXPOSE 5173

# Run Vite in dev mode, bound to all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]
