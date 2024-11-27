# Use a base image from Docker Hub
FROM node:14-alpine

# Set the working directory in the Docker image
WORKDIR /app

# Copy the local tgz package file into the image
# It's important to copy this first to leverage Docker's cache layering,
# and avoid reinstalling the package unnecessarily when other file changes occur.
COPY tms-backend-1.0.0.tgz ./

# Install the package from the local tgz file
# This command will install all dependencies including the specific tms-backend package into node_modules
RUN npm install ./tms-backend-1.0.0.tgz

# Copy the rest of your application code into the Docker image
# Make sure your .dockerignore file is set up to exclude unnecessary files (e.g., node_modules, .git, etc.)
COPY . .

# Set the working directory to the location of the server.js within the installed package
# This step is crucial because it changes the working directory to where the main executable file is
WORKDIR /app/node_modules/tms-backend

# Expose the port the app runs on
# Ensure $PORT is set at runtime or provide a default here
EXPOSE $PORT

RUN adduser -D baeldung
USER baeldung

# Command to run your application
# This runs "node server.js" from within the context of /app/node_modules/tms-backend
CMD ["node", "server.js"]
