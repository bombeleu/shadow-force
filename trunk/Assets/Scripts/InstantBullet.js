@script RequireComponent (Weapon)

public var damagePerSecond : float = 20.0;
private var frequency : float;
private var interval:float;

private var lastFireTime : float = -1;
private var spawnPoint:Transform;
function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	frequency = Network.sendRate;
	interval = 1/frequency;
}

function OnLaunchBullet(){
	if (Time.time > lastFireTime + interval) {
		var hitInfo : RaycastHit = (gameObject.GetComponentInChildren.<PerFrameRaycast> () as PerFrameRaycast).GetHitInfo();
		
		if (hitInfo.transform) {
			// Get the health component of the target if any
			var targetHealth : Health = hitInfo.transform.GetComponent.<Health> ();
			if (targetHealth) {
				// Apply damage
				if (networkView.isMine){//only apply damage if this is MY character!
					hitInfo.transform.networkView.RPC("OnDamage", RPCMode.All, 
						[damagePerSecond / frequency, -spawnPoint.forward]);
				}
			}
		}
		lastFireTime = Time.time;
	}
}

function OnStopFiring(){
	
}

function Update(){
}