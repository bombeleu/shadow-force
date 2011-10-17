#pragma strict
@script RequireComponent (Weapon)
//@script RequireComponent (NetworkView)
private var bulletPrefab: GameObject;

private var spawnPoint:Transform;

function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	bulletPrefab = GetComponent.<Weapon>().bulletPrefab;
}

function OnLaunchBullet(){
	//networkView.RPC("RPCLaunchBullet", RPCMode.All);//TODO: clone all current slow bullets to newly joined player
	Network.Instantiate(bulletPrefab, spawnPoint.position, spawnPoint.rotation, 0);
}

/*
@RPC
function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/