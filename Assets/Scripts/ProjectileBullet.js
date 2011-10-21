#pragma strict
@script RequireComponent (Weapon)

//public var maxVelocity:float = 15;

//@script RequireComponent (NetworkView)
private var bulletPrefab: GameObject;
private var spawnPoint:Transform;

function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	bulletPrefab = GetComponent.<Weapon>().bulletPrefab;
}

function OnLaunchBullet(pos:Vector3){
	//compute the rotation!
	var oriPos:Vector3 = Vector3(pos.x,pos.y,pos.z);
	var h0:float = spawnPoint.position.y - pos.y;
	pos.y = spawnPoint.position.y;
	var d:float = (pos - spawnPoint.position).magnitude;
	var g:float = Physics.gravity.magnitude;
	
	var hitInfo : RaycastHit = (gameObject.GetComponentInChildren.<PerFrameRaycast> () as PerFrameRaycast).GetHitInfo();
	var h : float = 4;
	
	var k : float;
	if (hitInfo.transform)
		k = hitInfo.distance>d?1:d / hitInfo.distance;
	else
		k = 1;

	var v_x:float;
	var v_y:float;
	if (k==1){
		var t:float = 2;
		v_x = d/t;
		//v_y = 0.5*g*t;
		v_y = (0.5*g*t*t-h0)/t;
	}else{
		/*var t0 = Mathf.Sqrt(h / (0.5*g*k - 0.5*g));
		v_x = d/(k*t0);
		v_y = (h+0.5*g*t0*t0)/t0;*/
		var t0 = Mathf.Sqrt( (h-(h-h0)/(k+1))/(0.5*g*((k*k+1)/(k+1)-1)) );
		v_x = d/(k*t0);
		v_y = (h-h0 + 0.5*g*t0*t0*(k*k+1))/(t0*(k+1));
	}
	Debug.Log("k: "+k+"rot: ");
	Debug.Log(t0);
	

	var dir:Vector3 = (pos - spawnPoint.position).normalized;
	var velo:Vector3 = Vector3(0,v_y,0) + Vector3(dir.x, 0, dir.z) * v_x;
	//var quat:Quaternion = Quaternion.FromToRotation(spawnPoint.forward, velo);
	//networkView.RPC("RPCLaunchBullet", RPCMode.All);//TODO: clone all current slow bullets to newly joined player
	var go:GameObject = Network.Instantiate(bulletPrefab, spawnPoint.position, 
		spawnPoint.rotation, 0);
	go.rigidbody.velocity = velo;
	go.rigidbody.angularVelocity = Vector3(Random.value,Random.value,Random.value)*Random.value*4;
	/*var go2:GameObject = Network.Instantiate(bulletPrefab, oriPos, 
		spawnPoint.rotation, 0);*/
}

/*
@RPC
function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/