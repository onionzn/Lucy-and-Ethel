using System;
using System.Net.Sockets;
using System.Text;
using UnityEngine;

public class TcpClientExample : MonoBehaviour
{
    TcpClient client;
    NetworkStream stream;
    byte[] receiveBuffer = new byte[1024];

    void Start()
    {
        ConnectToServer();
    }

    void ConnectToServer()
    {
        try
        {
            client = new TcpClient("localhost", 3000); // Replace "localhost" with the IP address of your Node.js server

            stream = client.GetStream();
            Debug.Log("Connected to server");
            
            // Start listening for incoming data in a separate thread or coroutine
            StartReceiving();
        }
        catch (Exception e)
        {
            Debug.LogError("Error connecting to server: " + e.Message);
        }
    }

    void StartReceiving()
    {
        // You can run this in a separate thread or coroutine
        while (true)
        {
            int bytesRead = stream.Read(receiveBuffer, 0, receiveBuffer.Length);
            if (bytesRead > 0)
            {
                string receivedData = Encoding.ASCII.GetString(receiveBuffer, 0, bytesRead);
                Debug.Log("Received data: " + receivedData);
                
                // Process the received data as needed
            }
        }
    }

    // Method to send a message to the server
    void SendMessageToServer(string message)
    {
        try
        {
            byte[] messageBytes = Encoding.ASCII.GetBytes(message);
            stream.Write(messageBytes, 0, messageBytes.Length);
            Debug.Log("Message sent to server: " + message);
        }
        catch (Exception e)
        {
            Debug.LogError("Error sending message to server: " + e.Message);
        }
    }

    void OnDestroy()
    {
        // Close the connection when the Unity application is closed
        if (client != null)
            client.Close();
    }
}
