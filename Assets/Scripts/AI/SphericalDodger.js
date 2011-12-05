#pragma strict
@script RequireComponent (SphereCollider)

private var sCollider:SphereCollider;
static public var dodgerRadius : float = 1.5;//buffer size


function Awake(){
	sCollider = collider as SphereCollider;
}

function OnTriggerStay (other : Collider) : void{
	var ai : DodgingAI = other.GetComponent.<DodgingAI>();
	if (ai){
		var dir:Vector3 = other.transform.position - transform.position;
		dir.y = 0;
		ai.OnEvadeZone(dir.normalized*(sCollider.radius + dodgerRadius + 0.5 - dir.magnitude));
	}
}
