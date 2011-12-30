#pragma strict

private var hitInfo : RaycastHit;
public var tr : Transform;
public var layerMask: LayerMask = (1 <<0) | (1 << 8);//default + Player mask;

public var hasRange:boolean = false;

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
private var casted:boolean = false;
function LateUpdate(){
	casted = false;
}

private var dir:Vector3;
private function CastRay () {
	//if (dir==null) GetDir();
	if (!weapon.owner) return;//TODO: this hack is to prevent error when owner die
	dir = weapon.owner.transform.forward;
	dir.y=0;
	var oriPos:Vector3 = GetOrigin();
	oriPos.y = tr.position.y;//only take the height from spawnPoint
	// Cast a ray to find out the end point of the laser
	hitInfo = RaycastHit ();
	//Physics.Raycast (tr.position, tr.forward, hitInfo);
	Physics.Raycast (oriPos, dir, hitInfo, hasRange?weapon.range:Mathf.Infinity, layerMask.value);
	casted = true;
}

function GetOrigin():Vector3{
	if (weapon.owner==null) return transform.position;
	return weapon.owner.transform.position + dir*0.7;//inside the body's capsule
}

function GetHitInfo () : RaycastHit {
	if (!casted) CastRay();
	return hitInfo;
}

function GetDir():Vector3{
	return dir;
}