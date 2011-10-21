#pragma strict

private var hitInfo : RaycastHit;
public var tr : Transform;

/*
function Awake () {
	tr = transform;
}*/

function Update () {
	// Cast a ray to find out the end point of the laser
	hitInfo = RaycastHit ();
	//Physics.Raycast (tr.position, tr.forward, hitInfo);
	Physics.Raycast (tr.position, Vector3(tr.forward.x,0,tr.forward.z), hitInfo);
}

function GetHitInfo () : RaycastHit {
	return hitInfo;
}
