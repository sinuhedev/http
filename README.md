# http

# example

```sh
# http
./src/http.js -x 3000 example 
# https
./src/http.js -s 3000 example
```

## create certificate
```sh
openssl req -days 3650 -nodes -new -x509 -keyout cert/server.key -out cert/server.cert -subj "/C=MX/ST=MX/L=MEXICO/O=DevCompany/OU=Dev/CN=localhost"
```