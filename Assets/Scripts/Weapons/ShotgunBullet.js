#pragma strict
@script RequireComponent (Weapon)
@script RequireComponent (NetworkView)

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
	networkView.RPC("EnableFiring", RPCMode.All);
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
	networkView.RPC("DisableFiring", RPCMode.All);
}

#if !UNITY_FLASH
@RPC
#endif

function DisableFiring(){
	firing = false;
}