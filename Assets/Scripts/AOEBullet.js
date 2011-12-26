#pragma strict
@script RequireComponent (Weapon)
@script RequireComponent (ShotgunBullet)

public var damage : float = 100.0;
public var hitLayers: LayerMask;
public var blockLayers: LayerMask;

private var spawnPoint:Transform;
private var wp:Weapon;
private var shotgun:ShotgunBullet;

function Awake(){
	wp = GetComponent(Weapon);
	spawnPoint = wp.spawnPoint;
	shotgun = GetComponent(ShotgunBullet);
}

function OnLaunchBullet(){
	if (networkView.isMine){//check for instant damage
		var cols:Collider[] = Physics.OverlapSphere(transform.position, wp.range, hitLayers);//not cast from gunpoint --> prevent through wall shooting
		var myHealth:Health = wp.owner.GetComponent(Health);
		for (var col:Collider in cols){
			var targetHealth : Health = col.GetComponent(Health);
			if (targetHealth && targetHealth!=myHealth) {
				//check for angle
				var forwardV:Vector3 = wp.owner.transform.forward;
				var toV:Vector3 = col.transform.position - transform.position;
				toV.y=0;
				var angle:float = Quaternion.FromToRotation(forwardV, toV).eulerAngles.y;
				if (angle>=270) angle = 360-angle;
				//Debug.Log("shotgun angle: "+angle);
				if (angle<shotgun.angle){
					//check for occluder
					//var hitInfo:RaycastHit;
					if (!Physics.Raycast(transform.position, toV, toV.magnitude, blockLayers)){
						// Apply damage
						NetworkU.RPC(col.GetComponent(Health), "OnDamage", NetRPCMode.All, 
							[damage, -wp.owner.transform.forward*7]);
					}
					//Debug.Log(hitInfo.transform);
					//Debug.Log(spawnPoint.position);
				}
			}
		}
	}
	SendMessage("OnStopFiring");
}

function Update(){
}
