@script RequireComponent (Weapon)
@script RequireComponent (InstantBullet)

public var frequency : float = 10;
public var muzzleFlashFront : GameObject;

private var bulletPrefab: GameObject;
private var firing:boolean = false;
private var lastFireTime : float = -1;

private var spawnPoint:Transform;
function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	bulletPrefab = GetComponent.<Weapon>().bulletPrefab;
	
	//muzzleFlashFront = gameObject.Find("muzzleFlash");
	//Debug.Log("muzzleFlash");
	//Debug.Log(muzzleFlashFront);
	muzzleFlashFront.active = false;
}

function Start(){
	lastFireTime = Time.time;
}

function OnLaunchBullet(){
	firing = true;
	muzzleFlashFront.active = true;
}

function OnStopFiring(){
	firing = false;
	muzzleFlashFront.active = false;
}

function Update(){
	if (firing && Time.time > lastFireTime + 1 / frequency) {
		var go : GameObject = Spawner.Spawn (bulletPrefab, spawnPoint.position, spawnPoint.rotation) as GameObject;
		
		var bullet : SimpleBullet = go.GetComponent.<SimpleBullet> ();
		bullet.dist = GetComponent.<InstantBullet>().GetHitDistance();
		lastFireTime = Time.time;
	}
}
