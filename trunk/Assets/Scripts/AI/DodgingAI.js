#pragma strict

public var motor : FreeMovementMotor;

private var escapeV : Vector3;
private var isActive:boolean = false;
private var _isActive:boolean = false;

function Start(){
	escapeV = Vector3.zero;
}

function OnEvadeZone(escapeDir:Vector3):void{
	escapeV += escapeDir;
	isActive = true;
}

function LateUpdate(){
	if (isActive){
		motor.movementDirection = escapeV.normalized;
		//motor.facingDirection = escapeV.normalized;
		//Debug.Log('dodging!');
	}
	escapeV = Vector3.zero;
	_isActive = isActive;
	isActive = false;
}

function IsActive():boolean{
	return _isActive;
}