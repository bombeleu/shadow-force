#pragma strict
@script RequireComponent (Weapon)

public var heightOffset:float = 0.5;
public var travelTime:float = 1.5;
//public var raycast:PerFrameRaycast;
public var blockLayers:LayerMask;

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

//z of the vector is the duration!
private function ComputeVelo(d:float, g:float, targetY:float, hitInfo:RaycastHit):Vector3{
	targetY = spawnPoint.position.y;
	var h0:float = spawnPoint.position.y - targetY;
	var h : float;// = wallHeight;
	
	var k : float;
	if (hitInfo.transform){
		if (hitInfo.distance > d){//no obstacle on the way
			k = 1;
		}else{//has obstacle
			k = d / hitInfo.distance;
			if (hitInfo.collider as BoxCollider != null){//obstacle is a box
				var box:BoxCollider = hitInfo.collider as BoxCollider;
				h = box.transform.position.y + box.extents.y * box.transform.lossyScale.y - targetY 
					+ heightOffset;
				//Debug.Log("trajectory height: "+h);
			}else if (hitInfo.collider as CapsuleCollider != null){
				var cap:CapsuleCollider = hitInfo.collider as CapsuleCollider;
				h = cap.transform.position.y + cap.height*0.5 * cap.transform.lossyScale.y - targetY 
					+ heightOffset;
				//Debug.Log("trajectory height capsule: "+h);
			}else{
				h = 5;
				Debug.Log("trajectory: this collider type is not supported!");
			}
		}
	}else
		k = 1;

	var v_x:float;
	var v_y:float;
	var duration:float;
	if (k==1){
		var t:float = travelTime;
		v_x = d/t;
		//v_y = 0.5*g*t;
		v_y = (0.5*g*t*t-h0)/t;
		duration = t;
	}else{
		/*var t0 = Mathf.Sqrt(h / (0.5*g*k - 0.5*g));
		v_x = d/(k*t0);
		v_y = (h+0.5*g*t0*t0)/t0;*/
		var t0 = Mathf.Sqrt( (h-(h-h0)/(k+1))/(0.5*g*((k*k+1)/(k+1)-1)) );
		v_x = d/(k*t0);
		v_y = (h-h0 + 0.5*g*t0*t0*(k*k+1))/(t0*(k+1));
		duration = k*t0;
	}
	return Vector3(v_x, v_y, duration);
}

function Compute(){
	//compute!
	var oriPos:Vector3 = Vector3(pos.x,pos.y,pos.z);
	var tarPos:Vector3 = oriPos;
	tarPos.y = spawnPoint.position.y;
	var direct:Vector3 = tarPos - spawnPoint.position;
	//pos.y = spawnPoint.position.y;
	var d:float = direct.magnitude;
	var g:float = Physics.gravity.magnitude;
	
	var hitInfo : RaycastHit;// = raycast.GetHitInfo();
	Physics.Raycast(spawnPoint.position, direct, hitInfo, d, blockLayers);
	var forwardRet = ComputeVelo(d, g, oriPos.y, hitInfo);
	
	Physics.Raycast(tarPos, -direct, hitInfo, d, blockLayers);
	var backwardRet = ComputeVelo(d, g, oriPos.y, hitInfo);
	
	var dir:Vector3 = direct.normalized;
	var finalRet:Vector3 = ( forwardRet.y > backwardRet.y )?forwardRet:backwardRet;
	outVelo = Vector3(0,finalRet.y,0) + Vector3(dir.x, 0, dir.z) * finalRet.x;
	outDuration = finalRet.z;
	
	//Debug.Log(forwardRet + " " + backwardRet);
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
