# balancer

## Install && start with basic conf
`npm use | npm install | npm start` or `./start.sh`

### Server for metrics
`http://${hostname}/metrics`

## Server for requests 
`http://${hostname}/api/*`

### API Doc

`/api/check` - is server available for requests

`/api/off` - turns server off

`/api/on` - turns server on

`/api/data` - return random data to user

### Docker info

`docker build -t server .` - build image
`docker run -d -p 5000:80 -p 8080:8080 server:latest` - start image