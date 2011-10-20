#pragma strict
@script RequireComponent (Weapon)
//@script RequireComponent (NetworkView)
private var bulletPrefab: GameObject;
private var spawnPoint:Transform;

function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	bulletPrefab = GetComponent.<Weapon>().bulletPrefab;
}
public var maxVelocity:float = 100;
function OnLaunchBullet(pos:Vector3){
	//compute the rotation!
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
	var v_max : float = maxVelocity;
	
	var a:float = 0.25 * g * g;
	var b:float = (g * h) - (v_max * v_max);
	var c:float = h*h + (d*d/(k*k));
	
	var delta:float = b*b - (4*a*c);
	
	//var t0_1 = Mathf.Sqrt((-b+Mathf.Sqrt(delta))/(2*a));
	var t0_1 = k==1?2:Mathf.Sqrt(h / (0.5*g*k - 0.5*g));
	//var t0_1 = (-b+Mathf.Sqrt(delta))/(2*a);
	
	var v_x = d/(k*t0_1);
	var v_y = (h+0.5*g*t0_1*t0_1)/t0_1;
	
	var rot:Vector3 = Vector3(0,v_y,v_x);
	//rot.Normalize();
	Debug.Log("k: "+k+"rot: ");
	Debug.Log(delta);
	Debug.Log(t0_1);
	Debug.Log(rot);
	

	var dir:Vector3 = (pos - spawnPoint.position).normalized;
	var velo:Vector3 = Vector3(0,v_y,0) + Vector3(dir.x, 0, dir.z) * v_x;
	var quat:Quaternion = Quaternion.FromToRotation(spawnPoint.forward, velo);
	//networkView.RPC("RPCLaunchBullet", RPCMode.All);//TODO: clone all current slow bullets to newly joined player
	var go:GameObject = Network.Instantiate(bulletPrefab, spawnPoint.position, 
		spawnPoint.rotation, 0);
	go.rigidbody.velocity = velo;
	var go2:GameObject = Network.Instantiate(bulletPrefab, pos + Vector3(0,1,0), 
		spawnPoint.rotation, 0);
}

/*
@RPC
function RPCLaunchBullet(){
	Instantiate (bulletPrefab, spawnPoint.position, spawnPoint.rotation);
}*/