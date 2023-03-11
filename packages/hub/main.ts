radio.onReceivedString(function (receivedString) {
  serial.writeLine(receivedString);
});
