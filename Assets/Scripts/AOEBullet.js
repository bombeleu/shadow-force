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
	if (NetworkU.IsMine(this)){//check for instant damage
		var cols:Collider[] = Physics.OverlapSphere(transform.position, wp.range, hitLayers);//not cast from gunpoint --> prevent through wall shooting
		var myHealth:Health = wp.owner.GetComponent(Health);
		for (var col:Collider in cols){
			var targetHealth : Health = col.GetComponent(Health);
			if (targetHealth && targetHealth!=myHealth) {
				//check for angle
				var forwardV:Vector3 = wp.owner.transform.forward;
				var oriPos:Vector3 = wp.owner.transform.position + wp.owner.transform.forward*0.7;
				var toV:Vector3 = col.transform.position - oriPos;
				toV.y=0;
				var angle:float = Quaternion.FromToRotation(forwardV, toV).eulerAngles.y;
				if (angle>=270) angle = 360-angle;
				//Debug.Log("shotgun angle: "+angle);
				var hit:boolean = false;
				if (angle<shotgun.angle){
					//check for occluder
					//var hitInfo:RaycastHit;
					if (!Physics.Raycast(oriPos, toV, toV.magnitude, blockLayers)){
						hit = true;
						// Apply damage
						#if UNITY_FLASH
						col.GetComponent(Health).OnDamage(damage, -toV.normalized*7);
						#else
						NetworkU.RPC(col.GetComponent(Health), "OnDamage", NetRPCMode.All, 
							[damage, -toV.normalized*7]);
						#endif
					}
					//Debug.Log(hitInfo.transform);
					//Debug.Log(spawnPoint.position);
				}
				if (!hit){//hear the noise!
					var ai:AICentral = targetHealth.GetComponent(AICentral);
					if (ai){
						if (ai.chaseAI) {
							ai.ForceChase(oriPos);//for those who is willing to chase
						}else ai.SayNoChase();
					}
				}
			}
		}
	}
	SendMessage("OnStopFiring");
}

function Update(){
}
