#pragma strict
#if !UNITY_FLASH
import System.Collections.Generic;
#endif

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

private var resting:boolean = true;
private var prohibitDirs : System.Collections.Generic.List.<Vector3> 
	= new System.Collections.Generic.List.<Vector3>();//TODO: flash-beta support here
function OnSafeZone(prohibitDir:Vector3):void{
	if (isActive) return;
	prohibitDirs.Add(prohibitDir);
	resting = true;
}

function FixedUpdate(){//fixed update because OnEvadeZone is called from physics events!
	//result is 1 frame late
	finalV = escapeV;
	_isActive = isActive;

	escapeV = Vector3.zero;
	isActive = false;
	resting = false;
	prohibitDirs.Clear();
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

function IsOnSafeZone():boolean{//on the buffer zone
	return resting;
}

function GetProhibitDirs():System.Collections.Generic.List.<Vector3>{
	return prohibitDirs;
}