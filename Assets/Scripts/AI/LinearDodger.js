#pragma strict
@script RequireComponent (SphereCollider)

public var velVector:Vector3;
public var velocity:float;
public var affectRadius:float;
static public var slowestDodgerVel : float = 3;
static public var dodgerRadius : float = 1;

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
private var affecting : Hashtable = new Hashtable();

function OnTriggerStay (other : Collider) : void{
/*	var ai : DodgingAI = other.GetComponentInChildren.<DodgingAI>();
	if (ai){
		var evadeTime : float = (affectRadius + dodgerRadius) / ai.motor.walkingSpeed;//TODO: use real dodger radius
		var center:Vector3 = transform.position + velVector * evadeTime;
		
		var dist:float = (other.transform.position - center).magnitude;
		Debug.Log('contact! '+dist);
		if (dist < affectRadius)
			ai.OnEvadeZone((other.transform.position - center).normalized*(affectRadius-dist) );
		else
			ai.OnEvaded();
	}*/
	var ai : DodgingAI = other.GetComponentInChildren.<DodgingAI>();
	if (ai){
		var dir:Vector3 = other.transform.position - transform.position;
		dir.y = 0;
		var velN : Vector3 = velVector.normalized;
		var offset:Vector3 = dir - velN*Vector3.Dot(dir, velN);
		var offsetM:float = offset.magnitude;
		var affectDist:float = affectRadius + dodgerRadius;
		if (offsetM < affectDist){
			if (!affecting.ContainsKey(ai.gameObject.GetInstanceID()))
				affecting.Add(ai.gameObject.GetInstanceID(), ai);
			ai.OnEvadeZone(offset.normalized*(affectDist-offsetM), gameObject);
		}else{
			ai.OnEvaded(gameObject);
		}
	}
}

function OnTriggerExit (other : Collider) : void{
	var ai : DodgingAI = other.GetComponentInChildren.<DodgingAI>();
	if (ai){
		if (affecting.ContainsKey(ai.gameObject.GetInstanceID()))
			affecting.Remove(ai.gameObject.GetInstanceID());
		ai.OnEvaded(gameObject);
	}
}

function OnDestroy(){
	for (var a:Object in affecting.Values){
		Debug.Log('dead!');
		(a as DodgingAI).OnEvaded(gameObject);
	}
}
