input.onButtonPressed(Button.A, function () {
  radio.sendString(
    JSON.stringify({
      n: 'C',
    })
  );
});

while (true) {
  radio.sendString(
    JSON.stringify({
      n: 'T',
      d: input.temperature(),
    })
  );
  basic.pause(1000);
}
