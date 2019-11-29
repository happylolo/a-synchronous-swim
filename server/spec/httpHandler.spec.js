
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const server = require('./mockServer');

const httpHandler = require('../js/httpHandler');
const queue = require('../js/messageQueue');
// Need to have this line, otherwise the queue won't get initialized.
// Instead of initialize the queue here at the very beginning, we can also initialize it in the GET test block for testing purpose.
httpHandler.initialize(queue);

describe('server responses', () => {

  it('should respond to a OPTIONS request', (done) => {
    // The HTTP OPTIONS method is used to describe the communication options for the target resource.
    let {req, res} = server.mock('/', 'OPTIONS');

    httpHandler.router(req, res);
    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
    console.log(res._data.toString());
    expect(res._data.toString()).to.be.empty;

    done();
  });

  it('should respond to a GET request for a swim command', (done) => {
    // write your test here
    let { req, res } = server.mock('/', 'GET');

    // Pre-load the queue with a command
    const commands = ['up', 'down', 'left', 'right'];
    let index = Math.floor(Math.random() * commands.length);
    queue.enqueue(commands[index]);

    httpHandler.router(req, res);
    // HTTP status code: 2XX - successful
    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
    // For GET request, we are going to expect a command that equals to the swim command that we push into the queue.
    expect(res._data.toString()).to.equal(commands[index]);
    expect(commands).to.contain(res._data.toString());
    done();
  });

  it('should respond with 404 to a GET request for a missing background image', (done) => {
    // Examine an imge that doesn't exist, we should get 404 for that.
    httpHandler.backgroundImageFile = path.join('.', 'spec', 'missing.jpg');
    // Pick a path for the background image, we will going to use this path in the client, server, and test. All these three things need to match and use the same url.
    let {req, res} = server.mock('/background.jpg', 'GET');

    httpHandler.router(req, res, () => {
      expect(res._responseCode).to.equal(404);
      expect(res._ended).to.equal(true);
      done();
    });
  });

  it('should respond with 200 to a GET request for a present background image', (done) => {
    // write your test here
    httpHandler.backgroundImageFile = path.join('.', 'spec', 'water-lg.jpg');
    let {req, res} = server.mock('/background.jpg', 'GET');

    httpHandler.router(req, res, () => {
      expect(res._responseCode).to.equal(200);
      expect(res._ended).to.equal(true);
      done();
    });
  });

  var postTestFile = path.join('.', 'spec', 'water-lg.multipart');

  it('should respond to a POST request to save a background image', (done) => {
    // Just test if the server respond correctly with some file data, didn't test if we saved the image to the server
    fs.readFile(postTestFile, (err, fileData) => {
      httpHandler.backgroundImageFile = path.join('.', 'spec', 'temp.jpg');
      let {req, res} = server.mock('/background.jpg', 'POST', fileData);

      httpHandler.router(req, res, () => {
        expect(res._responseCode).to.equal(201);
        expect(res._ended).to.equal(true);
        done();
      });
    });
  });

  it('should send back the previously saved image', (done) => {
    // Test if we are saving the file to the server. Use the POST request to send the image to the server first, and then turn around and make a GET request from the server. If the file exists, it will send back a response with that file.
    fs.readFile(postTestFile, (err, fileData) => {
      httpHandler.backgroundImageFile = path.join('.', 'spec', 'temp.jpg');
      let post = server.mock('/background.jpg', 'POST', fileData);

      httpHandler.router(post.req, post.res, () => {
        let get = server.mock('/background.jpg', 'GET');
        httpHandler.router(get.req, get.res, () => {
          const multipart = require('../js/multipartUtils');
          // Extract multipart from the fileData that we read at the very beginning
          let file = multipart.getFile(fileData);
          // get.res._data is the multipart image
          // Compare the file data from multipart with the data we received from the server. Remember the server is not sending a multipart file back, it's sending an image. So we are loading a multipart file from our tests, sending it to the server. The server is extracting the image and writing it to the hard drive.
          expect(Buffer.compare(file.data, get.res._data)).to.equal(0);
          done();
        });
      });
    });
  });
});
