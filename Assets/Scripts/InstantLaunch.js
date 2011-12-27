#pragma strict
@script RequireComponent (Weapon)

private var spawnPoint:Transform;
private var raycast: PerFrameRaycast;
private var bulletPrefab: GameObject;

private var myTeam;

function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	raycast = gameObject.GetComponentInChildren.<PerFrameRaycast>();
	bulletPrefab = GetComponent.<Weapon>().bulletPrefab;
}

function OnLaunchBullet(){
	var hitInfo : RaycastHit = raycast.GetHitInfo();
	
	if (hitInfo.transform) {
		var pos:Vector3 = hitInfo.point + hitInfo.normal *0.5;
		pos.y = 1.5;

				var flatten_normal:Vector3 = hitInfo.normal;
		flatten_normal.y = 0;
		ConnectionGUI.CreateTeamObject(bulletPrefab, NetworkU.AllocateID(), pos, Quaternion.LookRotation(flatten_normal), 
			LineOfSight.myTeam);
	}
}

function OnStopFiring(){
	
}

function Update(){
}