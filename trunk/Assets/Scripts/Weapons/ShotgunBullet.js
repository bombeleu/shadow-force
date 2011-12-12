#pragma strict
@script RequireComponent (Weapon)
@script RequireComponent (AOEBullet)
@script RequireComponent (PerFrameRaycast)
@script RequireComponent (NetworkView)

public var muzzleFlashFront : GameObject;
public var raycast: PerFrameRaycast;
public var numBullets : int  = 5;
public var range : int = 10;
public var angle : int = 15;

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

	for (var i : int = 0 ; i < numBullets; i++)
	{
		var go : GameObject = Spawner.Spawn (bulletPrefab, spawnPoint.position, wp.owner.transform.rotation) as GameObject;
		
		var bullet : SimpleBullet = go.GetComponent.<SimpleBullet> ();
		bullet.angle = -angle + ((2.0*angle*i)/numBullets);
		bullet.InitializeDirection();
		
		var hitInfo : RaycastHit = raycast.GetHitInfo();
		bullet.dist = hitInfo.transform?Mathf.Min(hitInfo.distance,range):range;
	}
}

function OnStopFiring(){
	networkView.RPC("DisableFiring", RPCMode.All);
}

@RPC
function DisableFiring(){
	firing = false;
	muzzleFlashFront.active = false;
}