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

const HOSTNAME = '0.0.0.0'
const CERT = import.meta.dirname + '/../cert'

const IS_HTTPS = process.argv[2] ? process.argv[2] === '-s' : false
const PORT = process.argv[3]
const CURRENT_PATH = process.argv[4] ?? process.cwd()

const options = IS_HTTPS
  ? {
      key: fs.readFileSync(CERT + '/server.key'),
      cert: fs.readFileSync(CERT + '/server.cert')
    }
  : {}

const server = IS_HTTPS ? https : http

server.createServer(options, (req, res) => {
  const baseURL = req.protocol + '://' + req.headers.host + '/'
  const reqUrl = new URL(req.url, baseURL)

  const uri = reqUrl.pathname
  const fileName = path.join(CURRENT_PATH, uri)

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
    return res.end(fs.readFileSync(CURRENT_PATH + '/index.html'))
  } else {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain')
    res.end('500 Internal Error\n')
  }
}).listen(PORT, HOSTNAME, () => {
  console.log('Server running at ' + (IS_HTTPS ? 'https://' : 'http://') + HOSTNAME + ':' + PORT + '\n')
})
