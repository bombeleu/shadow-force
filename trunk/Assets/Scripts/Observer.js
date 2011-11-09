#pragma strict

public var range: float = 15;
public var angle: float = 90;

private var enable: boolean = true;

private var viMeshScript:VisionMeshScript;

function Awake(){
	viMeshScript = gameObject.GetComponentInChildren(VisionMeshScript);
}

function Start(){
	viMeshScript.viewDistance = range;
	viMeshScript.viewAngle = angle/2;
}

function Update () {
}

function SetEnable(b:boolean){
	if (enable == b) return;
	enable = b;
	viMeshScript.enabled = b;
	viMeshScript.GetComponent.<Renderer>().enabled = b;
}

function GetEnable():boolean{
	return enable;
}