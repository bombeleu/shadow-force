
var updateInterval = 0.5;

private var accum : float = 0.0; // FPS accumulated over the interval
private var frames : int = 0; // Frames drawn over the interval
private var timeleft : float; // Left time for current interval

function Start()
{
    if( !guiText )
    {
        print ("FramesPerSecond needs a GUIText component!");
        enabled = false;
        return;
    }
    timeleft = updateInterval;  
    
    #if UNITY_EDITOR
    #else
    	gameObject.active = false;
    #endif
}

function Update()
{
	if (Time.timeScale < 0.00001f || Time.deltaTime < 0.00001f) return;
	
    timeleft -= Time.deltaTime;
    accum += Time.timeScale/Time.deltaTime;
    ++frames;
    
    // Interval ended - update GUI text and start new interval
    if( timeleft <= 0.0 )
    {
        // display two fractional digits (f2 format)
        //guiText.text = "" + (accum/frames).ToString("f2");
        var ffps : float = accum/frames;
        var ifps : int = ffps;
        guiText.text = "FPS:" + ifps.ToString();
        
        timeleft = updateInterval;
        accum = 0.0;
        frames = 0;
    }
}