# what base image to use
FROM node

# subsequent commands will run in this directory
# Sets the working directory for any RUN, CMD, ENTRYPOINT, COPY, and ADD
WORKDIR /app

# copy the package.json file to the container
COPY package.json /app

# install the dependencies
RUN npm install

# copy the rest of the application so that when codes change only this line would
# be re-run to update the container
# this is done to take advantage of the cache
# code change -> COPY reruns
# package.json change -> COPY package.json reruns, RUN npm install reruns and then COPY reruns
# if the package.json file changes, then the npm install command would be re-run
COPY . /app

# expose the port the app runs on
EXPOSE $PORT

# command to run the server when the container starts
CMD ["node", "server.js"]