#pragma strict
@script RequireComponent (Weapon)
@script RequireComponent (InstantBullet)
@script RequireComponent (NetworkView)

public var frequency : float = 10;
public var muzzleFlashFront : GameObject;
public var raycast: PerFrameRaycast;

private var bulletPrefab: GameObject;
private var firing:boolean = false;
private var lastFireTime : float = -1;

private var spawnPoint:Transform;
private var wp:Weapon;

function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	wp = GetComponent.<Weapon>();
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
	networkView.RPC("EnableFiring", RPCMode.All);
}

@RPC
function EnableFiring(){
	firing = true;
	muzzleFlashFront.active = true;
}

function OnStopFiring(){
	networkView.RPC("DisableFiring", RPCMode.All);
}

@RPC
function DisableFiring(){
	firing = false;
	muzzleFlashFront.active = false;
}

function Update(){
	if (firing && Time.time > lastFireTime + 1 / frequency) {
		var go : GameObject = Spawner.Spawn (bulletPrefab, spawnPoint.position, wp.owner.transform.rotation) as GameObject;
		
		var bullet : SimpleBullet = go.GetComponent.<SimpleBullet> ();
		bullet.InitializeDirection();
		var hitInfo : RaycastHit = raycast.GetHitInfo();
		bullet.dist = hitInfo.transform?hitInfo.distance:1000;
		
		/*if (networkView.isMine)
			bullet.dist = GetComponent.<InstantBullet>().GetHitDistance();
		else{
			var hitInfo : RaycastHit = RaycastHit ();
			Physics.Raycast (spawnPoint.position, spawnPoint.forward, hitInfo);
			bullet.dist = hitInfo.transform?hitInfo.distance:1000;
		}*/
			
		lastFireTime = Time.time;
	}
}