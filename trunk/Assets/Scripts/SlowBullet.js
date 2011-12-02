#pragma strict
@script RequireComponent (Weapon)
//@script RequireComponent (NetworkView)
private var bulletPrefab: GameObject;

private var spawnPoint:Transform;
private var weapon : Weapon;

function Awake(){
	weapon = GetComponent.<Weapon>();
	spawnPoint = weapon.spawnPoint;
	bulletPrefab = weapon.bulletPrefab;
}

function OnLaunchBullet(){
	//networkView.RPC("RPCLaunchBullet", RPCMode.All);//TODO: clone all current slow bullets to newly joined player
	Network.Instantiate(bulletPrefab, spawnPoint.position + weapon.owner.transform.forward, weapon.owner.transform.rotation, 0);
}

/*
@RPC
function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/