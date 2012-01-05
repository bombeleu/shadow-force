#pragma strict

//public var motor : FreeMovementMotor;

static public var slowestDodgerVel : float = 3;
static public var dodgerRadius : float = 0.95;//to compute running time
static public var dodgingBuffer:float = 0.5;


private var escapeV : Vector3;
private var finalV:Vector3;
private var isActive:boolean = false;
private var _isActive:boolean = false;

function Start(){
	escapeV = Vector3.zero;
}

private var isIgnoreShield:boolean;
function OnEvadeZone(escapeDir:Vector3, ignoreShield:boolean):void{
	escapeV += escapeDir;
	isActive = true;
	isIgnoreShield = ignoreShield;
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

function IsIgnoreShield():boolean{
	return isIgnoreShield;
}

function GetVector():Vector3{
	return finalV;
}

