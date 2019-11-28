// We don't want to lose any commands from the server, so we use this msgQueue to store all the keypress commands. We put these keypress commands in the msgQueue and then the HTTP reads the keypress commands from the msgQueue and determine whether or not to send a command to the client http or just send a blank response.

const messages = []; // the storage unit for messages

module.exports.enqueue = (message) => {
  console.log(`Enqueing message: ${message}`);
  messages.push(message);
};

module.exports.dequeue = () => {
  // returns undefined if messages array is empty
  return messages.shift();
};