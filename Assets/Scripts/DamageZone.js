#pragma strict
@script RequireComponent (Collider)

public var damagePerSecond:float;

private var frequency : float;
private var interval:float;
private var lastFireTime : float = -1;

function Awake(){
	frequency = Network.sendRate;
	interval = 1/frequency;
}

function OnTriggerStay (other : Collider) : void{
	var health : Health = other.GetComponent(Health);
	if (health){
		if (Time.time > lastFireTime + interval) {
			if (health.networkView.isMine){//defender message
				NetworkU.RPC(health, "OnDamage", NetRPCMode.All, 
					[damagePerSecond / frequency, Vector3.zero]);
			}
			lastFireTime = Time.time;
		}
	}
}
