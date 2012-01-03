#pragma strict
//@script RequireComponent (Rigidbody)
#if !UNITY_FLASH
@script RequireComponent (NetworkView)
#endif

private var startTime:float;
private var sVelo:Vector3;
private var sPos:Vector3;
private var sDuration:float;
private var impact:boolean = false;
public var explosionPrefab:GameObject;
function Start(){
	startTime = Time.time;
	//sVelo = rigidbody.velocity;
	sPos = transform.position;
	//rigidbody.useGravity = false;
	
	//rigidbody.angularVelocity = Vector3(Random.value,Random.value,Random.value)*Random.value*4;
}
function Update () {
	if (impact) return;
	var t:float = Time.time - startTime;
	if (t>sDuration){
		Instantiate(explosionPrefab, transform.position, Quaternion.identity);
		Destroy(gameObject);
	}
	//rigidbody.velocity = sVelo + Physics.gravity * t;
	transform.position = sPos + sVelo * t + 0.5 * Physics.gravity * t * t;
}

#if !UNITY_FLASH
function OnSerializeNetworkView (stream : BitStream, info : NetworkMessageInfo) {
	stream.Serialize(sVelo);
	if (stream.isReading){
		rigidbody.velocity = sVelo;
	}
}
#endif

function SetVelocity(velo:Vector3){
	sVelo = velo;
}
function SetDuration(duration:float){
	sDuration = duration;
}
