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
	var viComp:Visibility = GetComponent.<Visibility>();
	if (viComp){
		SetViMeshVisible(b & viComp.GetVisible());
	}else{
		SetViMeshVisible(b);
	}
}

function GetEnable():boolean{
	return enable;
}

function OnSetVisible(visi:boolean){
	SetViMeshVisible(visi & enable);
}

function SetViMeshVisible(b:boolean){
	viMeshScript.enabled = b;
	viMeshScript.renderer.enabled = b;
}