using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using System.IO.Ports;
using System.Text.Json;

public class NewBehaviourScript : MonoBehaviour
{
    // Start is called before the first frame update
    public int portNumber;
    public int baudRate;
    public string portName;
    private SerialPort serialPort = new SerialPort();
    

    string SetPortName()
    {
        Debug.Log("Here I am ");
        foreach (string x in SerialPort.GetPortNames()){
            Debug.Log(x); 
        }
        return "hehe";
    }
    void Start()
    {
        serialPort.BaudRate = 115200;
        serialPort.PortName = SetPortName();
        SetPortName();
    }

// Update is called once per frame
void Update()
    {
        
    }
}
