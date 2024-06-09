FROM node:20-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json into the directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Bundle the app source inside the Docker image
COPY . .

# Generate prism client
RUN npx prisma generate

# Build the application
RUN npm run build

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the Docker daemon
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD [ "npm", "run", "start:prod"]