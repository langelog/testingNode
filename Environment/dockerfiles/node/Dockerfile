FROM node:8

WORKDIR /app

RUN apt update && apt upgrade -y
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
RUN echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt update
RUN apt install vim zip unzip git build-essential telnet mongodb-org -y
RUN npm install nodemon -g
RUN npm install bower -g
RUN npm install truffle -g
RUN npm install ganache-cli -g
RUN apt install -y screen
RUN apt install -y qtcreator
RUN apt install -y qt5-default
RUN echo 'alias ll="ls -lah"' >> ~/.bashrc

EXPOSE 3000
