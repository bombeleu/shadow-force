#pragma strict

private var hitInfo : RaycastHit;
public var tr : Transform;

public var weapon : Weapon;
//private var dir : Transform;

/*
function GetDir () {
	//tr = transform;
	var p:Transform = transform;
	while (true){
		p = p.parent;
		var wm:WeaponManager = p.GetComponent.<WeaponManager>();
		if (wm!=null){
			dir = wm.transform;
			break;
		}
	}
}*/

function Update () {
	//if (dir==null) GetDir();
	var dir:Vector3 = weapon.owner.transform.forward;
	// Cast a ray to find out the end point of the laser
	hitInfo = RaycastHit ();
	//Physics.Raycast (tr.position, tr.forward, hitInfo);
	Physics.Raycast (tr.position, Vector3(dir.x,0,dir.z), hitInfo, Mathf.Infinity, (1 <<0) | (1 << 8));//default + Player mask
}

function GetHitInfo () : RaycastHit {
	return hitInfo;
}
