#pragma strict
@script RequireComponent (Weapon)

public var wallHeight:float = 4;
public var travelTime:float = 1.5;

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
	//compute!
	var oriPos:Vector3 = Vector3(pos.x,pos.y,pos.z);
	var h0:float = spawnPoint.position.y - pos.y;
	pos.y = spawnPoint.position.y;
	var d:float = (pos - spawnPoint.position).magnitude;
	var g:float = Physics.gravity.magnitude;
	
	var hitInfo : RaycastHit = (gameObject.GetComponentInChildren.<PerFrameRaycast> () as PerFrameRaycast).GetHitInfo();
	var h : float = wallHeight;
	
	var k : float;
	if (hitInfo.transform)
		k = hitInfo.distance>d?1:d / hitInfo.distance;
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
	//Debug.Log("k: "+k+"rot: ");
	//Debug.Log(t0);
	

	var dir:Vector3 = (pos - spawnPoint.position).normalized;
	outVelo = Vector3(0,v_y,0) + Vector3(dir.x, 0, dir.z) * v_x;
}

function GetComputedVelocity():Vector3{
	return outVelo;
}

function GetDuration():float{
	return outDuration;
}
