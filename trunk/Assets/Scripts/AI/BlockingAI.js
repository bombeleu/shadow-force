#pragma strict

public var motor : FreeMovementMotor;

private var blockV : Vector3;
private var isActive:boolean = false;
private var _isActive:boolean = false;

function Start(){
	blockV = Vector3.zero;
}

function OnBlockZone(blockDir:Vector3):void{
	blockV += blockDir;
	isActive = true;
}

function LateUpdate(){
	if (isActive){
		//motor.movementDirection = escapeV.normalized;
		motor.facingDirection = blockV.normalized;
		//Debug.Log('dodging!');
	}
	//if (!_isActive)
	//	motor.facingDirection = Vector3.zero;
	
	blockV = Vector3.zero;
	_isActive = isActive;
	isActive = false;
}

function IsActive():boolean{
	return _isActive;
}