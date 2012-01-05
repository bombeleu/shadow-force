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

function CheckValidTarget(pos:Vector3){
	return trajectory.OnUpdateTarget(pos);
}

function OnLaunchBullet(pos:Vector3){
	var velo:Vector3 = trajectory.GetComputedVelocity();
	var duration:float = trajectory.GetDuration();
	var go:GameObject = NetworkU.Instantiate(bulletPrefab, spawnPoint.position, 
		spawnPoint.rotation);
	//go.rigidbody.velocity = velo;
	go.SendMessage("SetVelocity", velo);//TODO: network sync correct?
	go.SendMessage("SetDuration", duration);
	
	
	//for doding ai
	var affectRadius:float = 2.5;//TODO: remove hard code
	var startEvadeTime:float = duration - (affectRadius + DodgingAI.dodgerRadius + DodgingAI.dodgingBuffer) 
		/ DodgingAI.slowestDodgerVel;
	yield WaitForSeconds(startEvadeTime);
	var dodgingZone = new GameObject();
	dodgingZone.transform.position = pos;
	var sphere:SphereCollider = dodgingZone.AddComponent(SphereCollider);
	sphere.radius = affectRadius+DodgingAI.dodgingBuffer;
	sphere.isTrigger = true;
	dodgingZone.AddComponent(SphericalDodger);
	
	yield WaitForSeconds(duration - startEvadeTime);
	Destroy(dodgingZone);
	
	/*var dodger: GravityDodger = go.GetComponentInChildren.<GravityDodger>();
	if (dodger){
		//dodger.affectRadius = 5;
		dodger.landingTime = duration;
		dodger.landingPos = pos;
		dodger.Initialize();
	}*/
	
	//go.rigidbody.angularVelocity = Vector3(Random.value,Random.value,Random.value)*Random.value*4;
}

/*
#if !UNITY_FLASH
@RPC
#endif

function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/