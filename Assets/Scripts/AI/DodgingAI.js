#pragma strict

//public var motor : FreeMovementMotor;

private var escapeV : Vector3;
private var finalV:Vector3;
private var isActive:boolean = false;
private var _isActive:boolean = false;

function Start(){
	escapeV = Vector3.zero;
}

function OnEvadeZone(escapeDir:Vector3):void{
	escapeV += escapeDir;
	isActive = true;
}

function FixedUpdate(){
	//result is 1 frame late
	finalV = escapeV;
	_isActive = isActive;

	escapeV = Vector3.zero;
	isActive = false;
}

function IsActive():boolean{
	return _isActive;
}

function GetVector():Vector3{
	return finalV;
}