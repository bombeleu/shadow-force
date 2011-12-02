#pragma strict

public var motor : FreeMovementMotor;

private var escapeV : Vector3;
private var isActive:boolean = false;

function Start(){
	escapeV = Vector3.zero;
}

function OnEvadeZone(escapeDir:Vector3):void{
	escapeV += escapeDir;
	isActive = true;
}

function LateUpdate(){
	if (isActive)
		motor.movementDirection = escapeV.normalized;
	escapeV = Vector3.zero;
	isActive = false;
}

function IsActive():boolean{
	return isActive;
}