
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

  var postTestFile = path.join('.', 'spec', 'water-lg.jpg');

  it('should respond to a POST request to save a background image', (done) => {
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

  xit('should send back the previously saved image', (done) => {
    fs.readFile(postTestFile, (err, fileData) => {
      httpHandler.backgroundImageFile = path.join('.', 'spec', 'temp.jpg');
      let post = server.mock('FILL_ME_IN', 'POST', fileData);

      httpHandler.router(post.req, post.res, () => {
        let get = server.mock('FILL_ME_IN', 'GET');
        httpHandler.router(get.req, get.res, () => {
          expect(Buffer.compare(fileData, get.res._data)).to.equal(0);
          done();
        });
      });
    });
  });
});
