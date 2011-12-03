#pragma strict
@script RequireComponent (Weapon)
@script RequireComponent (AOEBullet)
@script RequireComponent (NetworkView)

public var frequency : float = 1;
public var muzzleFlashFront : GameObject;
public var raycast: PerFrameConeCast;
public var numBullets : int  = 5;

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
		var angle : int = raycast.angle;
		for (var i : int = 0 ; i < numBullets; i++)
		{
			var go : GameObject = Spawner.Spawn (bulletPrefab, spawnPoint.position, wp.owner.transform.rotation) as GameObject;
			
			var bullet : SimpleBullet = go.GetComponent.<SimpleBullet> ();
			bullet.angle = -angle + ((i+0.00001)/numBullets*(2*angle));
			bullet.InitializeDirection();
			
			var hitInfo : RaycastHit = raycast.GetHitInfo();
			bullet.dist = hitInfo.transform?hitInfo.distance:1000;
		
		}
		lastFireTime = Time.time;
	}
}
