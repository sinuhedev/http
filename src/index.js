#!/usr/bin/env node

import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import fs from 'node:fs'

const CURRENT_PATH = process.argv[2] ?? process.cwd()

// Array of Mime Types
const mimeTypes = {
  // Text Types
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  json: 'application/json',
  // Image Types
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  icon: 'image/x-icon',
  // Audio and Video Types
  webm: 'video/webm',
  ogg: 'video/ogg',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  // Font Types
  ttf: 'font/ttf',
  otf: 'font/otf',
  woff: 'font/woff',
  woff2: 'font/woff2',
  // Application Types
  pdf: 'application/pdf',
  // wasm
  wasm: 'application/wasm',
  //
  ostream: 'application/octet-stream'
}

const CERT = import.meta.dirname + '/../cert'
const HOSTNAME = '0.0.0.0'
const PORT = 8080
const PORT_S = 8443

const servers = (req, res) => {
  const baseURL = req.protocol + '://' + req.headers.host + '/'
  const reqUrl = new URL(req.url, baseURL)
  const uri = reqUrl.pathname
  const pathName = path.join(CURRENT_PATH, uri)

  console.log('Loading ' + uri)

  try {
    const stats = fs.lstatSync(pathName)

    // Check if file or directory
    if (stats.isFile()) {
      const extension = path.extname(pathName).split('.').reverse()[0]
      const mimeType = extension in mimeTypes ? mimeTypes[extension] : mimeTypes.ostream

      res.statusCode = 200
      res.setHeader('Content-Type', mimeType)

      const fileStream = fs.createReadStream(pathName)
      fileStream.pipe(res)
    } else if (stats.isDirectory()) {
      const index = fs.readFileSync(pathName + '/index.html')

      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(index)
    }
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.write('404 : Not Found /index.html')
    res.end()
  }
}

http.createServer({}, servers).listen(PORT, HOSTNAME, () => {
  console.log('Server running at http://' + HOSTNAME + ':' + PORT)
})

https.createServer({
  key: fs.readFileSync(CERT + '/server.key'),
  cert: fs.readFileSync(CERT + '/server.cert')
}, servers).listen(PORT_S, HOSTNAME, () => {
  console.log('Server running at https://' + HOSTNAME + ':' + PORT_S)
})
