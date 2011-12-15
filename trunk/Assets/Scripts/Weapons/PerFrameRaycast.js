#pragma strict

private var hitInfo : RaycastHit;
public var tr : Transform;
public var layerMask: LayerMask = (1 <<0) | (1 << 8);//default + Player mask;

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
private var dir:Vector3;
function Update () {
	//if (dir==null) GetDir();
	if (!weapon.owner) return;//TODO: this hack is to prevent error when owner die
	dir = weapon.owner.transform.forward;
	dir.y=0;
	// Cast a ray to find out the end point of the laser
	hitInfo = RaycastHit ();
	//Physics.Raycast (tr.position, tr.forward, hitInfo);
	Physics.Raycast (tr.position, dir, hitInfo, Mathf.Infinity, layerMask.value);
}

function GetHitInfo () : RaycastHit {
	return hitInfo;
}

function GetDir():Vector3{
	return dir;
}