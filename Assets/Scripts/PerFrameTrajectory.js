#pragma strict
@script RequireComponent (Weapon)

public var wallHeight:float = 4;
public var travelTime:float = 1.5;
public var raycast:PerFrameRaycast;

private var spawnPoint:Transform;
private var outVelo: Vector3;
private var outDuration: float = 0;
private var pos: Vector3;


function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
	pos = spawnPoint.position;
}

function OnUpdateTarget(p:Vector3){
	pos = p;
	Compute();
}

function Compute(){
	//compute!
	var oriPos:Vector3 = Vector3(pos.x,pos.y,pos.z);
	var h0:float = spawnPoint.position.y - pos.y;
	var direct:Vector3 = Vector3(pos.x,spawnPoint.position.y,pos.z) - spawnPoint.position;
	//pos.y = spawnPoint.position.y;
	var d:float = direct.magnitude;
	var g:float = Physics.gravity.magnitude;
	
	var hitInfo : RaycastHit = raycast.GetHitInfo();
	var h : float = wallHeight;
	
	var k : float;
	if (hitInfo.transform)
		k = hitInfo.distance>d?1:(d / hitInfo.distance);
	else
		k = 1;

	var v_x:float;
	var v_y:float;
	if (k==1){
		var t:float = travelTime;
		v_x = d/t;
		//v_y = 0.5*g*t;
		v_y = (0.5*g*t*t-h0)/t;
		outDuration = t;
	}else{
		/*var t0 = Mathf.Sqrt(h / (0.5*g*k - 0.5*g));
		v_x = d/(k*t0);
		v_y = (h+0.5*g*t0*t0)/t0;*/
		var t0 = Mathf.Sqrt( (h-(h-h0)/(k+1))/(0.5*g*((k*k+1)/(k+1)-1)) );
		v_x = d/(k*t0);
		v_y = (h-h0 + 0.5*g*t0*t0*(k*k+1))/(t0*(k+1));
		outDuration = k*t0;
	}
	/*if (hitInfo.transform)
		Debug.Log("k: "+k+"-d: "+d+"-hit: "+hitInfo.distance);
	Debug.Log(t0);*/
	

	var dir:Vector3 = direct.normalized;
	outVelo = Vector3(0,v_y,0) + Vector3(dir.x, 0, dir.z) * v_x;
}

function GetComputedVelocity():Vector3{
	return outVelo;
}

function GetDuration():float{
	return outDuration;
}

function OnSerializeNetworkView (stream : BitStream, info : NetworkMessageInfo) {
	stream.Serialize(pos);
	if (stream.isReading){
		Compute();
		//Debug.Log(pos);
	}
}
