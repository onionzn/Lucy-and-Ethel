using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.Events;

[System.Serializable]
public class ReceiveDataEvent : UnityEvent<string> {}

[System.Serializable]
public class ReadFromServerEvent : UnityEvent {}

public class ReadFromServer : MonoBehaviour
{
    public string url = "http://localhost:8000";
    public float requestInterval = 0.5f;

    private float _requestRate = 0.0f;
    public float RequestRate {
        get { return _requestRate; }
    }

    public ReceiveDataEvent OnReceiveData;
    public ReadFromServerEvent OnSlowdown;
    private float ButtonThreshold = 100.0f;

    // Start is called before the first frame update
    void Start() {
        StartCoroutine(ContinuousRequest());

        OnReceiveData.AddListener((data) => {
            Debug.Log($"Recv Data: {data} at rate .");
            // TODO: parse data into a floating number and store it in value
            float value = 10.0f;
            SignalKukaMovement(value);
        });

        OnSlowdown.AddListener(() => {
            Debug.Log("Slowdown detected");
        });
    }

    private void SignalKukaMovement(float value) {
        bool hit = false;
        if (value > ButtonThreshold) {
            hit = true;
        }

        // Create a form to send data in the request body
        WWWForm form = new WWWForm();
        form.AddField("hit", hit.ToString());

        // Create a POST request to signal a hit to the KVP client
        string hitUrl = "http://localhost:8000/hit";
        UnityWebRequest webRequest = UnityWebRequest.Post(hitUrl, form);
        
        // Send the POST request
        webRequest.SendWebRequest();
    }

    private IEnumerator ContinuousRequest()
    {
        float lastRequestTime = 0.0f;
        while (true)
        {
            var watchTotal = System.Diagnostics.Stopwatch.StartNew();
            if (lastRequestTime < requestInterval) {
                yield return new WaitForSeconds(requestInterval - lastRequestTime);
            } else {
                OnSlowdown.Invoke();
            }

            var watchRequest = System.Diagnostics.Stopwatch.StartNew();

            UnityWebRequest webRequest = UnityWebRequest.Get(url);
            
            yield return webRequest.SendWebRequest();

            if (webRequest.result == UnityWebRequest.Result.ConnectionError || webRequest.result == UnityWebRequest.Result.ProtocolError)
            {
                Debug.LogError("Request error: " + webRequest.error);
            }
            else
            {
                string responseData = webRequest.downloadHandler.text;
                OnReceiveData.Invoke(responseData);
            }

            watchTotal.Stop();
            watchRequest.Stop();

            lastRequestTime = watchRequest.ElapsedMilliseconds / 1000.0f;
            _requestRate = watchTotal.ElapsedMilliseconds / 1000.0f;
        }
    }
}
