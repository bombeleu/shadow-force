#pragma strict

public var range: float = 15;
public var angle: float = 90;

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

