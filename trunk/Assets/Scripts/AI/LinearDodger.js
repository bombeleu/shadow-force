#pragma strict
@script RequireComponent (SphereCollider)

@HideInInspector
public var velVector:Vector3;

@HideInInspector
public var velocity:float;

@HideInInspector
public var affectRadius:float;

static public var slowestDodgerVel : float = 3;
static public var dodgerRadius : float = 1.5;//buffer size

public var bounce:boolean = false;

function Initialize(){
	var sphereC = collider as SphereCollider;
	var evadeTime : float = (affectRadius + dodgerRadius) / slowestDodgerVel;
	sphereC.radius = evadeTime * velocity;
	sphereC.isTrigger = true;

	checkDistance = evadeTime * velocity;
}

private var checkDistance:float;

/*
function Update(){
	var hitInfo : RaycastHit;
	Physics.SphereCast(transform.position, affectRadius, velVector.normalized, hitInfo, checkDistance);
	//Physics.Raycast(transform.position, velVector.normalized, hitInfo);
	if (hitInfo.transform){
		var ai : DodgingAI = hitInfo.transform.GetComponentInChildren.<DodgingAI>();
		if (ai){
			Debug.Log('evade!');
			ai.OnEvadeZone(Vector3(velVector.z,0,-velVector.x));
		}
	}
}
*/

function OnTriggerStay (other : Collider) : void{
	var ai : DodgingAI = other.GetComponent.<DodgingAI>();
	if (ai){
		var dir:Vector3 = other.transform.position - transform.position;
		dir.y = 0;
		var velN : Vector3 = velVector.normalized;
		var dotN:float = Vector3.Dot(dir, velN);
		if (dotN<0) return;
		var offset:Vector3 = dir - velN*dotN;
		var offsetM:float = offset.magnitude;
		var affectDist:float = affectRadius + dodgerRadius;
		if (offsetM < affectDist){
			ai.OnEvadeZone(offset.normalized*(affectDist-offsetM));
		}
	}
}
