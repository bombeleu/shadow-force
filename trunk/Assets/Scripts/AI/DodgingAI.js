#pragma strict

public var motor : FreeMovementMotor;

private var escapeV : Vector3;

function Start(){
	escapeV = Vector3.zero;
}

private var affectors: System.Collections.Generic.Dictionary.<Object, Vector3> = new System.Collections.Generic.Dictionary.<Object, Vector3>();
function OnEvadeZone(escapeDir:Vector3, from:GameObject):void{
	//Debug.Log('evade!');
	if (!affectors.ContainsKey(from.GetInstanceID())){
		affectors.Add(from.GetInstanceID(), escapeDir);
		escapeV += escapeDir;
	}else{
		escapeV += escapeDir - affectors[from.GetInstanceID()];
		affectors.Remove(from.GetInstanceID());
		affectors.Add(from.GetInstanceID(), escapeDir);
	}
	motor.movementDirection = escapeV.normalized;
}

function OnEvaded(from:GameObject):void{
	if (affectors.ContainsKey(from.GetInstanceID())){
		escapeV -= affectors[from.GetInstanceID()];
		affectors.Remove(from.GetInstanceID());
		motor.movementDirection = escapeV.normalized;
	}
}
