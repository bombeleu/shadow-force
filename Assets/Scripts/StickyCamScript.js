#pragma strict

public var timer:float = 1;
public var observer : Observer;
public var animationComponent:Animation;
public var initAnimation:AnimationClip;
public var visionMesh: VisionMeshScript;

private var startTime:float = -1;
private var activated:boolean = false;


private enum State{
	Flying,
	Initializing,
	Operating
};
private var state:State = State.Flying;
private var dir:Vector3;
public var speed : float = 15.0;

private var facingVec:Vector3;
private var startRot:Quaternion;
function Start(){
	//startTime = Time.time;
	//observer.SetEnable(false);
	observer.enabled = false;
	dir = transform.forward;
	dir.y = 0;
	startRot = Quaternion.LookRotation(dir);
}
function Update () {
	/*if (!activated && (Time.time - startTime > timer)){
		activated = true;
		//observer.SetEnable(true);
		observer.enabled = true;
	}*/
	if (state == State.Flying){
		transform.rotation = startRot; 	
		transform.position += (dir * speed) * Time.deltaTime;
	}else if (state == State.Initializing){
		var t:float = (Time.time - startTime);
		var t2 = t/initAnimation.length;
		t/=timer;
		if (t>1){
			state = State.Operating;
			observer.enabled = true;
		}else{
			transform.rotation = Quaternion.Lerp(startRot, Quaternion.LookRotation(-facingVec), t2);
		}
	}
}

function OnCollisionEnter(collision : Collision) {
	if (state!=State.Flying) return;
	startTime = Time.time;
	state = State.Initializing;
	
	#if UNITY_FLASH
	rigidbody.velocity = Vector3.zero;//rigidBody seems not destroy in flash!
	rigidbody.angularVelocity = Vector3.zero;
	rigidbody.isKinematic = true;
	rigidbody.detectCollisions = false;
	#endif
	Destroy(rigidbody);
	
	animationComponent.Play(initAnimation.name);
	var normal:Vector3 = Vector3.zero;
	for (var contact : ContactPoint in collision.contacts)
		normal+=contact.normal;
	//normal/=collision.contacts.Length;
	facingVec = normal;
	facingVec.y = 0;
	
	if (!collision.collider.gameObject.isStatic){//stick to enemy!
		transform.parent = collision.collider.transform;
		/*var scale:Vector3 = transform.parent.transform.lossyScale;
		Debug.Log("attach"+scale);
		transform.localScale = Vector3(1/scale.x, 1/scale.y, 1/scale.z);*/
	}
	
	/*
    // Debug-draw all contact points and normals
    for (var contact : ContactPoint in collision.contacts)
        Debug.DrawRay(contact.point, contact.normal, Color.white);
    
    // Play a sound if the coliding objects had a big impact.        
    if (collision.relativeVelocity.magnitude > 2)
        audio.Play();*/
}