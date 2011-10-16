@script RequireComponent (Weapon)
private var bulletPrefab: GameObject;

private var spawnPoint:Transform;

function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	bulletPrefab = GetComponent.<Weapon>().bulletPrefab;
}

function OnLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}