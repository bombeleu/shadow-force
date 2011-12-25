#pragma strict

private var blockV : Vector3;
private var finalV:Vector3;
private var isActive:boolean = false;
private var _isActive:boolean = false;

function Start(){
	blockV = Vector3.zero;
}

function OnBlockZone(blockDir:Vector3):void{
	blockV += blockDir;
	isActive = true;
}

function FixedUpdate(){
	finalV = blockV;
	blockV = Vector3.zero;
	_isActive = isActive;
	isActive = false;
}

function IsActive():boolean{
	return _isActive;
}

function GetVector():Vector3{
	return finalV;
}