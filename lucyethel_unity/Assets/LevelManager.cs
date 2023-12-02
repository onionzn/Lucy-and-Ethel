using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.Events;
using System.Linq;

[System.Serializable]
public class ReceiveDataEvent : UnityEvent<string> {}

[System.Serializable]
public class LevelManagerEvent : UnityEvent {}

public class LevelManager : MonoBehaviour
{
    public string url = "http://localhost:8000";
    public float requestInterval = 0.5f;

    private float _requestRate = 0.0f;
    public float RequestRate {
        get { return _requestRate; }
    }

    public GameObject plate;
    public string[] platePositions;
    private int plateIdx = 0;
    public ReceiveDataEvent OnReceiveData;
    public LevelManagerEvent OnSlowdown;
    private float ButtonThreshold = 20.0f;

    private float prevValue = -1000.0f;

    private bool isValid(float value) {
        return value >= ButtonThreshold;
    }

    void SetPlatePosition(string pos)
    {
        float[] posValues = pos.Split(",").Select(s => float.Parse(s.Trim())).ToArray();
        plate.transform.localPosition = new Vector3(posValues[0] / 1000 + 0.18415f, posValues[2] / 1000 - 0.80645f, posValues[1] / 1000 - 0.04f);
        // plate.transform.eulerAngles = new Vector3(90f, 0f, 0f);
    }

    // Start is called before the first frame update
    void Start() {
        SetPlatePosition(platePositions[0]);
        SignalKukaMovement();

        StartCoroutine(ContinuousRequest());

        OnReceiveData.AddListener((data) => {
            // Debug.Log($"Recv Data: {data} at rate .");
            float value = float.Parse(data);
            
            // Move KUKA after detecting a release
            if (isValid(prevValue) && !isValid(value)) {
                Debug.Log($"Detected a release! {prevValue}");
                plateIdx += 1;
                if (plateIdx < platePositions.Length)
                {
                    SignalKukaMovement();
                    SignalPlateMovement();
                }
            }

            prevValue = value;
        });

        OnSlowdown.AddListener(() => {
            Debug.Log("Slowdown detected");
        });
    }

    private void SignalPlateMovement()
    {
        string currPos = platePositions[plateIdx];
        SetPlatePosition(currPos);
        plate.SetActive(false);
        Invoke("SetActivePlateDelayed", 2f);
    }

    void SetActivePlateDelayed()
    {
        plate.SetActive(true);
    }

    private void SignalKukaMovement() {
        // Create a form to send data in the request body
        WWWForm form = new WWWForm();
        form.AddField("position", platePositions[plateIdx]);

        // Create a POST request to signal a hit to the KVP client
        string hitUrl = "http://localhost:8000/move";
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
