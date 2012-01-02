#pragma strict
@script ExecuteInEditMode()

public var rotating:boolean = true;
public var scaling:boolean = true;

public var degreePerSecond:float = 90;
public var maxScaleRatio:float = 1.5;
public var scaleInterval:float = 0.5;

private var curAngle:float = 0;
private var curScale:float = 1;
private var startTime:float = -1;

function Start(){
	startTime = Time.time;
}

function Update(){
	var t:float = Time.time - startTime;
	curAngle = (t * degreePerSecond)%360;
	var scalePhase:boolean =(Mathf.FloorToInt (t/scaleInterval)%2)==0;
	curScale = (maxScaleRatio - 1)*(t%scaleInterval)/scaleInterval;
	if (scalePhase)//growing
		curScale+=1;
	else//shrinking
		curScale = maxScaleRatio - curScale;
	
	transform.localRotation = Quaternion.AngleAxis(curAngle, Vector3.up);
	transform.localScale = Vector3(curScale, curScale, curScale);
}