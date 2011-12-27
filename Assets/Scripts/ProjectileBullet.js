#pragma strict
@script RequireComponent (Weapon)
@script RequireComponent (PerFrameTrajectory)

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
	var go:GameObject = NetworkU.Instantiate(bulletPrefab, spawnPoint.position, 
		spawnPoint.rotation);
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
}

/*
#if !UNITY_FLASH
@RPC
#endif

function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/