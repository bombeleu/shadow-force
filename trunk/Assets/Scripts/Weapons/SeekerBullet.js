#pragma strict

public var speed : float = 15.0;
//public var lifeTime : float = 1.5;
public var damageAmount : float = 5;
public var forceAmount : float = 5;
public var radius : float = 1.0;
public var seekPrecision : float = 1.3;
public var ignoreLayers : LayerMask;
public var noise : float = 0.0;
public var explosionPrefab : GameObject;

private var dir : Vector3;
private var spawnTime : float;
//private var targetObject : GameObject;
private var tr : Transform;
private var sideBias : float;

public var dodger:LinearDodger;
function OnEnable () {
	tr = transform;
	dir = transform.forward;
	dir.y = 0;
	//targetObject = GameObject.FindWithTag ("Player");
	spawnTime = Time.time;
	sideBias = Mathf.Sin (Time.time * 5);
	
	if (dodger){
		dodger.velocity = speed;
		dodger.velVector = dir.normalized * speed;
		dodger.affectRadius = (collider as SphereCollider).radius;
		dodger.Initialize();
	}
}

function Update () {
	
	/*if (Time.time > spawnTime + lifeTime) {
		Spawner.Destroy (gameObject);
	}*/
	
	/*
	if (targetObject) {
		var targetPos : Vector3 = targetObject.transform.position;
		targetPos += transform.right * (Mathf.PingPong (Time.time, 1.0f) - 0.5f) * noise;
		var targetDir : Vector3 = (targetPos - tr.position);		var targetDist : float = targetDir.magnitude;
		targetDir /= targetDist;
		if (Time.time - spawnTime < lifeTime * 0.2 && targetDist > 3)
			targetDir += transform.right * 0.5 * sideBias;
		
		dir = Vector3.Slerp (dir, targetDir, Time.deltaTime * seekPrecision);
	
		tr.rotation = Quaternion.LookRotation(dir); 	
		tr.position += (dir * speed) * Time.deltaTime;
	}//*/
	tr.rotation = Quaternion.LookRotation(dir); 	
	tr.position += (dir * speed) * Time.deltaTime;
	
		/*// Get the rigidbody if any
		if (c.rigidbody) {
			// Apply force to the target object
			var force : Vector3 = tr.forward * forceAmount;
			force.y = 0;
			c.rigidbody.AddForce (force, ForceMode.Impulse);
		}*/
}

function Explode(){
	Spawner.Destroy (gameObject);
	//Network.RemoveRPCs(gameObject, 0);
	//Network.DestroyPlayerObjects(gameObject);

	Spawner.Spawn (explosionPrefab, transform.position, transform.rotation);
}

public var bounceTime : int = 5;
function OnCollisionEnter(collision : Collision) {
	var targetHealth : Health = collision.transform.GetComponent.<Health> ();
	if (targetHealth) {
		if (targetHealth.networkView.isMine){//only apply damage if it hits MY character!
			targetHealth.transform.networkView.RPC("OnDamage", RPCMode.All, 
				[damageAmount, -transform.forward]);
		}
		Explode();
		return;
	}

    // Debug-draw all contact points and normals
    if (bounceTime==0){
    	Explode();
    	return;
    }
    bounceTime --;
    var norm : Vector3 = Vector3.zero;
    for (var contact : ContactPoint in collision.contacts)
    	norm += contact.normal;
        //Debug.DrawRay(contact.point, contact.normal, Color.white);
    norm.Normalize();
    
    dir -= norm * Vector3.Dot(dir, norm) * 2;
    dir.y = 0;
    
    if (dodger){
		//dodger.velocity = speed;
		dodger.velVector = dir.normalized * speed;
	}
}
