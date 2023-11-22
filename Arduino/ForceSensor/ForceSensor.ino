#include "HX711.h"

HX711 scale;

uint8_t dataPin = A1;
uint8_t clockPin = A0;
float value = 0;
float currentTime, prevTime = 0;

void setup()
{
  Serial.begin(115200);
  delay(1000);

  scale.begin(dataPin, clockPin);

  Serial.print("UNITS: ");
  Serial.println(scale.get_units(10));

  // load cell factor 5 KG
  scale.set_scale(420.0983);       // TODO you need to calibrate this yourself.
  scale.tare();

  Serial.print("ZEROED UNITS: ");
  Serial.println(scale.get_units(10));
}


void loop()
{
  // read until stable
  
  value = scale.get_units(10); // this takes A LOT of time
  
  Serial.print("Value: ");
  Serial.print(value);
  Serial.print("\t");

  // Why is it so slow?
  currentTime = millis();
  Serial.print("Loop Time: ");
  Serial.println(currentTime-prevTime);
  prevTime = currentTime;
}


// -- END OF FILE --

