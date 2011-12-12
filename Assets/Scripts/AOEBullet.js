#pragma strict
@script RequireComponent (Weapon)

public var damage : float = 100.0;

private var spawnPoint:Transform;

function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
}

function OnLaunchBullet(){
	var hitInfo : RaycastHit = gameObject.GetComponentInChildren.<PerFrameRaycast>().GetHitInfo();
	
	if (hitInfo.transform) {
		// Get the health component of the target if any
		var targetHealth : Health = hitInfo.transform.GetComponent.<Health> ();
		if (targetHealth) {
			// Apply damage
			if (networkView.isMine){//only apply damage if this is MY character!
				hitInfo.transform.networkView.RPC("OnDamage", RPCMode.All, 
					[damage, -spawnPoint.forward]);
			}
		}
	}
	SendMessage("OnStopFiring");
}


function Update(){
}