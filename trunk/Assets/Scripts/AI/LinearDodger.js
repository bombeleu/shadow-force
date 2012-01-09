#pragma strict
@script RequireComponent (Collider)

@HideInInspector
public var velVector:Vector3;

@HideInInspector
public var velocity:float;

@HideInInspector
public var affectRadius:float;


public var blockerLayers:LayerMask;
public var bounce:boolean = false;
public var needDetection:boolean = false;
public var myTeam:Team;
public var visibility:Visibility;

private var checkDistance:float;
private var capsule:CapsuleCollider;

function Initialize(){
	capsule = collider as CapsuleCollider;
	var evadeTime : float = (affectRadius + DodgingAI.dodgerRadius) / DodgingAI.slowestDodgerVel;
	capsule.height = evadeTime * velocity;
	checkDistance = capsule.height * 0.5;
	capsule.radius = affectRadius + DodgingAI.dodgerRadius + DodgingAI.dodgingBuffer;
	capsule.isTrigger = true;

	transform.localRotation = Quaternion.Euler(90, 0, 0);
	transform.localPosition = Vector3(0, 0, capsule.height*0.5);
	//Debug.Log("capsule init");
	
	checkDistance = evadeTime * velocity;
}

function OnTriggerStay (other : Collider) : void{
	if (needDetection){
		var otherTeam:Team = other.GetComponent(Team);
		if (otherTeam && otherTeam.team!=myTeam.team && !visibility.IsDetected()){
			//Debug.Log("won't dodge");
			return;//can't dodge/block undetected bullet!
		}
	}
	var ai : DodgingAI = other.GetComponent(DodgingAI);
	if (ai){
		var dir:Vector3 = other.transform.position - transform.position;
		dir.y = 0;
		var velN : Vector3 = velVector.normalized;
		var dotN:float = Vector3.Dot(dir, velN);
		//if (dotN<0) return;
		var offset:Vector3 = dir - velN*dotN;
		var offsetM:float = offset.magnitude;
		var affectDist:float = capsule.radius - DodgingAI.dodgingBuffer;//so that dodger stay active at the edge --> remove fluctuation problem!
		//if (offsetM < affectDist){
		//check blocker
		var oriPos:Vector3 = transform.position-velN*checkDistance;
		if (!Physics.Raycast(oriPos, velN, (other.transform.position-oriPos).magnitude, blockerLayers)){//not blocked
			if (affectDist > offsetM){
				ai.OnEvadeZone(offset.normalized*(affectDist-offsetM), false);
			}else{
				ai.OnSafeZone(-offset.normalized);//resting on buffer zone
			}
		}
		//}
	}
	var blocker : BlockingAI = other.GetComponent(BlockingAI);
	if (blocker){
		var bdir:Vector3 = transform.up;
		bdir.y = 0;
		blocker.OnBlockZone(-bdir);
	}
}
