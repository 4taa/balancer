# FROM golang:alpine AS build

# # Копируем исходный код в Docker-контейнер
# WORKDIR /server
# COPY . .

# RUN go build -mod=vendor cmd/slow/main.go

# # Копируем на чистый образ
# FROM alpine

# COPY --from=build /server/main /main

# #CMD ['./main', '-port=:80', '-metrics=:8080']
# CMD './main'

FROM node:10

# Create app directory
WORKDIR /server

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

#CMD ['./main', '-port=:80', '-metrics=:8080']
# RUN node index.js -p 80 -m 8080
CMD npm start