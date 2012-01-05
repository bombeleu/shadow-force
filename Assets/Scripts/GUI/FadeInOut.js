#pragma strict

public var fadeOutTexture : Texture;
public var fadeSpeed = 0.3;

var drawDepth = -10;

private var alpha = 0.0; 

private var fadeDir = 0;

function OnGUI(){
    
    alpha += fadeDir * fadeSpeed * Time.deltaTime;  
    if (Time.timeScale < 0.0001f)
    {
    	alpha += fadeDir * fadeSpeed * (1/30f);
    }
    alpha = Mathf.Clamp(alpha,0,0.5);   
    
    GUI.color.a = alpha;
    
    GUI.depth = drawDepth;
    
    GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), fadeOutTexture);
}

function fadeIn(){
    fadeDir = -1;   
}

function fadeOut(){
    fadeDir = 1;    
}

function Start(){
   // alpha=1;
    //fadeIn();
}