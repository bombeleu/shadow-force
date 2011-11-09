#pragma strict

public var timer:float = 1;

private var startTime:float = -1;
private var activated:boolean = false;

public var observer : Observer;

function Start(){
	startTime = Time.time;
	observer.SetEnable(false);
}
function Update () {
	if (!activated && (Time.time - startTime > timer)){
		activated = true;
		observer.SetEnable(true);
	}
}