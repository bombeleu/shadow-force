#pragma strict
@script RequireComponent (Weapon)

public var createTeamObject:boolean = false;
public var ownerRadius:float = 0.95;
public var bulletRadius:float = 0.9;
public var blockerLayers:LayerMask;

private var bulletPrefab: GameObject;

private var spawnPoint:Transform;
private var weapon : Weapon;

function Awake(){
	weapon = GetComponent(Weapon);
	spawnPoint = weapon.spawnPoint;
	bulletPrefab = weapon.bulletPrefab;
}

function OnLaunchBullet(){
	var spawnPos:Vector3 = weapon.owner.transform.position + weapon.owner.transform.forward *(ownerRadius + bulletRadius + 0.4);
	spawnPos.y = spawnPoint.position.y;
	//check if shooting through a blocker
	if (Physics.OverlapSphere(spawnPos, bulletRadius, blockerLayers).Length>0)
		return;
	
	if (createTeamObject){
		ConnectionGUI.CreateTeamObject(bulletPrefab, NetworkU.AllocateID(), spawnPos, weapon.owner.transform.rotation, 
			LineOfSight.myTeam);
	}else
		NetworkU.Instantiate(bulletPrefab, spawnPos, weapon.owner.transform.rotation);
}

/*
#if !UNITY_FLASH
@RPC
#endif

function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/