#pragma strict
@script RequireComponent (SphereCollider)

private var sCollider:SphereCollider;

function Awake(){
	sCollider = collider as SphereCollider;
}

function OnTriggerStay (other : Collider) : void{
	var ai : DodgingAI = other.GetComponent.<DodgingAI>();
	if (ai){
		var dir:Vector3 = ai.transform.position - transform.position;
		dir.y = 0;
		var affectDist:float = sCollider.radius - DodgingAI.dodgingBuffer + DodgingAI.dodgerRadius;
		var dist:float = dir.magnitude;
		//ai.OnEvadeZone( dist<=affectDist? 
		//	dir.normalized*(affectDist - dist):
		//	Vector3.zero, true);//stay in buffer zone
		ai.OnEvadeZone(  
			dir.normalized*(dist<=affectDist?(affectDist - dist):
			FreeMovementMotor.ControllerOffset), true);//stay in buffer zone
	}
}
