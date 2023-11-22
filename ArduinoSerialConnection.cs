
void setup() {
  //connect to serial
  printArray(Serial.list());
  myPort = new Serial(this, Serial.list()[1], 38400);
}