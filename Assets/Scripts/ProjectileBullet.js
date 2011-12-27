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
	var go:GameObject = Network.Instantiate(bulletPrefab, spawnPoint.position, 
		spawnPoint.rotation, 0);
	//go.rigidbody.velocity = velo;
	go.SendMessage("SetVelocity",velo);
	var dodger: GravityDodger = go.GetComponentInChildren.<GravityDodger>();
	if (dodger){
		dodger.affectRadius = 5;
		dodger.landingTime = trajectory.GetDuration();
		dodger.landingPos = pos;
		dodger.Initialize();
	}
	
	//go.rigidbody.angularVelocity = Vector3(Random.value,Random.value,Random.value)*Random.value*4;
	/*var go2:GameObject = Network.Instantiate(bulletPrefab, oriPos, 
		spawnPoint.rotation, 0);*/
}

/*
#if !UNITY_FLASH
@RPC
#endif

function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/