
void setup() {
  Serial.begin(115200);
  Serial.println("Serial Port Connected");
  delay(1000);
}

void loop() {
  Serial.print("Arduino Running for: ");
  Serial.print(millis());
  Serial.println("ms");
  delay(1000);
}
