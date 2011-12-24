#pragma strict
@script RequireComponent (Weapon)
//@script RequireComponent (NetworkView)

public var createTeamObject:boolean = false;

private var bulletPrefab: GameObject;

private var spawnPoint:Transform;
private var weapon : Weapon;

function Awake(){
	weapon = GetComponent(Weapon);
	spawnPoint = weapon.spawnPoint;
	bulletPrefab = weapon.bulletPrefab;
}

function OnLaunchBullet(){
	var spawnPos:Vector3 = spawnPoint.position + weapon.owner.transform.forward;
	//networkView.RPC("RPCLaunchBullet", RPCMode.All);//TODO: clone all current slow bullets to newly joined player
	if (createTeamObject){
		ConnectionGUI.CreateTeamObject(bulletPrefab, Network.AllocateViewID(), spawnPos, weapon.owner.transform.rotation, 
			LineOfSight.myTeam);
	}else
		Network.Instantiate(bulletPrefab, spawnPos, weapon.owner.transform.rotation, 0);
}

/*
@RPC
function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/