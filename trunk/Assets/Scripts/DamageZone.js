#pragma strict
@script RequireComponent (Collider)

public var damagePerSecond:float;

private var frequency : float;
private var interval:float;
private var lastFireTime : float = -1;

function Awake(){
	frequency = NetworkU.SendRate();
	interval = 1/frequency;
}

function OnTriggerStay (other : Collider) : void{
	var health : Health = other.GetComponent(Health);
	if (health){
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
