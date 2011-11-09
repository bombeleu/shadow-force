#pragma strict
@script RequireComponent (Weapon)

private var spawnPoint:Transform;
private var raycast: PerFrameRaycast;
private var bulletPrefab: GameObject;

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
		var bullet = Network.Instantiate(bulletPrefab, pos, Quaternion.LookRotation(hitInfo.normal), 0);
		bullet.GetComponent.<Team>().SetTeam(3-Camera.main.GetComponent.<Team>().team);
	}
}

function OnStopFiring(){
	
}

function Update(){
}