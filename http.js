#!/usr/bin/env node

import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import fs from 'node:fs'

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

const hostname = '0.0.0.0'
const CERT = import.meta.dirname + '/../cert'

const argv = [
  process.argv[2],
  process.argv[3],
  process.argv[4]
]

const isHttps = argv.includes('-s')
const port = argv.find(e => !isNaN(e)) ?? 3000
const currentPath = argv.find(e => isNaN(e)) ?? process.cwd()

const options = isHttps
  ? {
      key: fs.readFileSync(CERT + '/server.key'),
      cert: fs.readFileSync(CERT + '/server.cert')
    }
  : {}

const server = isHttps ? https : http

server.createServer(options, (req, res) => {
  const baseURL = req.protocol + '://' + req.headers.host + '/'
  const reqUrl = new URL(req.url, baseURL)

  const uri = reqUrl.pathname
  const fileName = path.join(currentPath, uri)

  console.log('Loading ' + uri)

  let stats
  try {
    stats = fs.lstatSync(fileName)
  } catch (e) {
    // If file not found
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.write('404 not Found\n')
    res.end()
    return
  }

  // Check if file or directory
  if (stats.isFile()) {
    const extension = path.extname(fileName).split('.').reverse()[0]
    const mimeType = extension in mimeTypes ? mimeTypes[extension] : mimeTypes.ostream

    res.statusCode = 200
    res.setHeader('Content-Type', mimeType)

    const fileStream = fs.createReadStream(fileName)
    fileStream.pipe(res)
  } else if (stats.isDirectory()) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    return res.end(fs.readFileSync(currentPath + '/index.html'))
  } else {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain')
    res.end('500 Internal Error\n')
  }
}).listen(port, hostname, () => {
  console.log('Server running at ' + (isHttps ? 'https://' : 'http://') + hostname + ':' + port + '\n')
})
