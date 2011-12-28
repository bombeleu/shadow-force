#pragma strict
@script RequireComponent (Collider)

public var damagePerSecond:float;
public var raycastCheck:boolean = false;
public var raycast:PerFrameRaycast;

private var frequency : float;
private var interval:float;
private var lastFireTime : float = -1;

function Awake(){
	frequency = NetworkU.SendRate();
	interval = 1/frequency;
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
		if (raycastCheck && raycast.GetHitInfo().transform){//blocked
			Debug.Log(raycast.GetHitInfo().transform);
			return;
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
