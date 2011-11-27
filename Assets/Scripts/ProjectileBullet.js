#pragma strict
@script RequireComponent (Weapon)
@script RequireComponent (PerFrameTrajectory)

//@script RequireComponent (NetworkView)
private var bulletPrefab: GameObject;
private var spawnPoint:Transform;
private var trajectory:PerFrameTrajectory;

function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	bulletPrefab = GetComponent.<Weapon>().bulletPrefab;
	trajectory = GetComponent.<PerFrameTrajectory>();
}

function OnLaunchBullet(pos:Vector3){
	trajectory.OnUpdateTarget(pos);
	var velo:Vector3 = trajectory.GetComputedVelocity();
	//var quat:Quaternion = Quaternion.FromToRotation(spawnPoint.forward, velo);
	//networkView.RPC("RPCLaunchBullet", RPCMode.All);//TODO: clone all current slow bullets to newly joined player
	var go:GameObject = Network.Instantiate(bulletPrefab, spawnPoint.position, 
		spawnPoint.rotation, 0);
	//go.rigidbody.velocity = velo;
	go.SendMessage("SetVelocity",velo);
	//go.rigidbody.angularVelocity = Vector3(Random.value,Random.value,Random.value)*Random.value*4;
	/*var go2:GameObject = Network.Instantiate(bulletPrefab, oriPos, 
		spawnPoint.rotation, 0);*/
}

/*
@RPC
function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/