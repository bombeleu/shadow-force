#pragma strict
@script RequireComponent (Weapon)
#if !UNITY_FLASH
@script RequireComponent (NetworkView)
#endif

public var fireEffect : Transform;
public var raycast: PerFrameRaycast;
public var numBullets : int  = 5;
public var angle : float = 15;

private var bulletPrefab: GameObject;
private var firing:boolean = false;
private var lastFireTime : float = -1;

private var spawnPoint:Transform;
private var wp:Weapon;

function Awake(){
	wp = GetComponent(Weapon);
	spawnPoint = wp.spawnPoint;
	bulletPrefab = wp.bulletPrefab;
	
}

function Start(){
	lastFireTime = Time.time;
}

function OnLaunchBullet(){
	NetworkU.RPC(this, "EnableFiring", NetRPCMode.All);
}

#if !UNITY_FLASH
@RPC
#endif
function EnableFiring(){
	firing = true;
	Instantiate(fireEffect,spawnPoint.position,Quaternion.identity);
	for (var i : int = 0 ; i < numBullets; i++)
	{
		var go : GameObject = Spawner.Spawn (bulletPrefab, spawnPoint.position, wp.owner.transform.rotation) as GameObject;
		
		var bullet : SimpleBullet = go.GetComponent(SimpleBullet);
		bullet.angle = -angle + ((2.0*angle*i)/numBullets);
		bullet.InitializeDirection();
		
		var hitInfo : RaycastHit = raycast.GetHitInfo();
		bullet.dist = hitInfo.transform?Mathf.Min(hitInfo.distance,wp.range):wp.range;
	}
}

function OnStopFiring(){
	NetworkU.RPC(this, "DisableFiring", NetRPCMode.All);
}

#if !UNITY_FLASH
@RPC
#endif
function DisableFiring(){
	firing = false;
}