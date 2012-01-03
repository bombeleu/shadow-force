#pragma strict
@script RequireComponent (Collider)

public var damagePerSecond:float;

public var hasSphericalDodger:boolean = false;
private var sphere:SphereCollider;

public var raycastCheck:boolean = false;//to support flame thrower
public var raycast:PerFrameRaycast;

private var frequency : float;
private var interval:float;
private var lastFireTime : float = -1;

function Awake(){
	frequency = NetworkU.SendRate();
	interval = 1/frequency;
	if (hasSphericalDodger){
		sphere = collider as SphereCollider;
		sphere.radius += DodgingAI.dodgingBuffer;
	}
}

function OnEnable(){
	if (raycast) raycast.enabled = true;
}

function OnDisable(){
	if (raycast) raycast.enabled = false;
}


function OnTriggerStay (other : Collider) : void{
	var health : Health = other.GetComponent(Health);
	if (health){
		if (hasSphericalDodger){
			var dist:float = (health.transform.position - transform.position).magnitude;
			if (dist > sphere.radius + DodgingAI.dodgerRadius - DodgingAI.dodgingBuffer)
				return;//no damage on buffer zone!
		}
		if (raycastCheck){
			var hit:RaycastHit = raycast.GetHitInfo();
			if (hit.transform && 
				hit.distance < (health.transform.position - raycast.GetOrigin()).magnitude){
				//blocked, check like this because there could be more than 1 target in the AOE zone
				return;
			}
		}
		if (Time.time > lastFireTime + interval) {
			if (NetworkU.IsMine(health)){//defender message
				#if UNITY_FLASH
				health.OnDamage(damagePerSecond / frequency, Vector3.zero);
				#else
				NetworkU.RPC(health, "OnDamage", NetRPCMode.All, 
					[damagePerSecond / frequency, Vector3.zero]);
				#endif
			}
			lastFireTime = Time.time;
		}
	}
}
