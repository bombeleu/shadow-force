#pragma strict
@script RequireComponent (SphereCollider)

@HideInInspector
public var landingTime:float;
@HideInInspector
public var landingPos:Vector3;

@HideInInspector
public var affectRadius:float;

static public var slowestDodgerVel : float = 3;
static public var dodgerRadius : float = 1.5;

private var startEvadeTime:float;
private var sphereC:SphereCollider;
function Initialize(){
	sphereC = collider as SphereCollider;
	startEvadeTime = landingTime - (affectRadius + dodgerRadius) / slowestDodgerVel;

	sphereC.radius = affectRadius;
	sphereC.isTrigger = true;
	sphereC.enabled = false;
}

private var fireTime:float;
function Start(){
	fireTime = Time.time;
}

function Update () {
	if (Time.time - fireTime >= startEvadeTime){
		sphereC.enabled = true;
	}
}

function OnTriggerStay (other : Collider) : void{
	var ai : DodgingAI = other.GetComponent.<DodgingAI>();
	if (ai){
		var dir:Vector3 = other.transform.position - landingPos;
		dir.y = 0;
		ai.OnEvadeZone(dir.normalized*(affectRadius-dir.magnitude));
	}
}