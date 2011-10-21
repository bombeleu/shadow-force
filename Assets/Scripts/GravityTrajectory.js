#pragma strict
@script RequireComponent (Rigidbody)

private var startTime:float;
private var sVelo:Vector3;
private var sPos:Vector3;
private var impact:boolean = false;
function Start(){
	startTime = Time.time;
	sVelo = rigidbody.velocity;
	sPos = rigidbody.position;
	rigidbody.useGravity = false;
}
function Update () {
	if (impact) return;
	var t:float = Time.time - startTime;
	rigidbody.velocity = sVelo + Physics.gravity * t;
	rigidbody.position = sPos + sVelo * t + 0.5 * Physics.gravity * t * t;
}

function OnCollisionEnter(collision : Collision) {
	if (impact) return;
	//Debug.Log("impact!");
	//if (Time.time - startTime <1) return;
    impact = true;
    rigidbody.useGravity = true;
}