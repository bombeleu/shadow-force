#pragma strict
@script RequireComponent (Weapon)

private var spawnPoint:Transform;

function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
}

function OnLaunchBullet(){
	var hitInfo : RaycastHit = gameObject.GetComponentInChildren.<PerFrameRaycast>().GetHitInfo();
	
	if (hitInfo.transform) {
		var pos:Vector3 = hitInfo.point + hitInfo.normal *0.5;
		pos.y = 1.5;
		var bullet = Network.Instantiate(GetComponent.<Weapon>().bulletPrefab, pos, Quaternion.LookRotation(hitInfo.normal), 0);
		bullet.GetComponent.<Team>().team = Camera.main.GetComponent.<Team>().team;
	}
}

function OnStopFiring(){
	
}

function Update(){
}