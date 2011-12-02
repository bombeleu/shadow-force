#pragma strict

public var motor : FreeMovementMotor;

private var escapeV : Vector3;

function Start(){
	escapeV = Vector3.zero;
}

function OnEvadeZone(escapeDir:Vector3):void{
	escapeV += escapeDir;
}

function LateUpdate(){
	motor.movementDirection = escapeV.normalized;
	escapeV = Vector3.zero;
}
