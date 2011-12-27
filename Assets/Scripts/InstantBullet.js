#pragma strict
@script RequireComponent (Weapon)

public var damagePerSecond : float = 20.0;
private var frequency : float;
private var interval:float;

private var lastFireTime : float = -1;
private var spawnPoint:Transform;
private var weapon:Weapon;
function Awake(){
	weapon = GetComponent(Weapon);
	spawnPoint = weapon.spawnPoint;
	frequency = NetworkU.SendRate();
	interval = 1/frequency;
}

public var raycast: PerFrameRaycast;
function OnLaunchBullet(){
	var hitInfo : RaycastHit = raycast.GetHitInfo();
	if (Time.time > lastFireTime + interval) {
		
		if (hitInfo.transform) {
			// Get the health component of the target if any
			var targetHealth : Health = hitInfo.transform.GetComponent(Health);
			if (targetHealth) {
				// Apply damage
				if (NetworkU.IsMine(this)){//only apply damage if this is MY character!
					NetworkU.RPC(targetHealth, "OnDamage", NetRPCMode.All, 
						[damagePerSecond / frequency, -weapon.owner.transform.forward*2]);
				}
			}
		}
		lastFireTime = Time.time;
	}
	
	if (hitInfo.transform) {
		var ai : DodgingAI = hitInfo.transform.GetComponent(DodgingAI);
		if (ai){
			var dir:Vector3 = hitInfo.transform.position - spawnPoint.position;
			dir.y = 0;
			var velN : Vector3 = raycast.GetDir().normalized;
			var offset:Vector3 = dir - velN*Vector3.Dot(dir, velN);
			ai.OnEvadeZone(offset.normalized);//TODO: use real size
		}
		var blocker : BlockingAI = hitInfo.transform.GetComponent(BlockingAI);
		if (blocker){
			blocker.OnBlockZone(-weapon.owner.transform.forward);
		}
	}	
}

function OnStopFiring(){
	
}

function Update(){
}