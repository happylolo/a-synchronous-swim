const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

let messageQueue = null;
module.exports.initialize = (queue) => {
  messageQueue = queue;
};

// Node.js Documentation: https://nodejs.org/api/http.html
// req and res object in Node.js: http://www.murvinlai.com/req-and-res-in-nodejs.html
module.exports.router = (req, res, next = () => { }) => {
  // console.log('Serving request type ' + req.method + ' for url ' + req.url);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    next();
  }

  if (req.method === 'GET') {
    if (req.url === '/') {
      // response.writeHead(statusCode[, statusMessage][, headers]): send a response header to the request.
      // This method must only be called once on a message and it must be called before response.end() is called.
      res.writeHead(200, headers);
      // response.end([data[, encoding]][, callback]): this method signals to the server that all of the response headers and body have been sent; that server should consider this message complete.
      if (messageQueue) {
        // response.end() MUST be called on each response.
        // If callback is specified, it will be called when the response stream is finished.
        res.end(messageQueue.dequeue()); // data is a string or a Buffer
      } else {
        res.end();
      }
      // The next() function is not a part of the Node.js or Express API, but is the third argument that is passed to the middleware function. The next() function could be named anything, but by convention it is always named “next”. To avoid confusion, always use this convention.
      // invoke next() here at the end of a request to help with testing!
      next();
    }

    if (req.url === '/background.jpg') {
      // fs.readFile(path[, options], callback): https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
      fs.readFile(module.exports.backgroundImageFile, (err, fileData) => {
        if (err) {
          res.writeHead(404, headers);
        } else {
          res.writeHead(200, headers);
          // Encode the binary data.
          res.write(fileData, 'binary');
        }

        res.end();
        next();
      });
    }
  }
};
