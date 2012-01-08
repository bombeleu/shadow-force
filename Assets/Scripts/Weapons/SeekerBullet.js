#pragma strict

public var speed : float = 15.0;
//public var lifeTime : float = 1.5;
public var damageAmount : float = 5;
public var explosionPrefab : GameObject;
public var isBounce:boolean = true;

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
    if (Time.time - spawnTime > lifeTime){//(bounceTime==0){
    	Explode();
    	return;
    }

	tr.rotation = Quaternion.LookRotation(dir); 	
	tr.position += (dir * speed) * Time.deltaTime;
	
}

function Explode(){
	Spawner.Destroy (gameObject);
	Spawner.Spawn (explosionPrefab, transform.position, transform.rotation);
}

//public var bounceTime : int = 5;
public var lifeTime:float = 6;

public var isArrow:boolean = false;
function OnCollisionEnter(collision : Collision) {
	if (isArrow){
		var ragdoll:RagdollController = collision.transform.GetComponent(RagdollController);
		if (ragdoll){
			ragdoll.DieByArrow(transform);//TODO:add network code
			gameObject.layer = LineOfSight.LAYER_ARROW_WITH_RAGDOLL;
		}else{
			rigidbody.isKinematic = true;
			rigidbody.velocity = Vector3.zero;
			speed = 0;
		}
	}else{
		var targetHealth : Health = collision.transform.GetComponent(Health);
		if (targetHealth) {
			if (NetworkU.IsMine(targetHealth)){//only apply damage if it hits MY character!
				#if UNITY_FLASH
				targetHealth.OnDamage(damageAmount, -transform.forward*5);
				#else
				NetworkU.RPC(targetHealth, "OnDamage", NetRPCMode.All, 
					[damageAmount, -transform.forward*5]);
				#endif
			}
			Explode();
			return;
		}
	}

	if (isBounce){
	    // Debug-draw all contact points and normals
	    //bounceTime --;
	    var norm : Vector3 = Vector3.zero;
	    for (var contact : ContactPoint in collision.contacts)
	    	norm += contact.normal;
	        //Debug.DrawRay(contact.point, contact.normal, Color.white);
	    norm.Normalize();
	    
	    dir -= norm * Vector3.Dot(dir, norm) * 2;
	    dir.y = 0;
    }
    
    Spawner.Spawn (explosionPrefab, transform.position, transform.rotation);
    
    if (dodger){
		//dodger.velocity = speed;
		dodger.velVector = dir.normalized * speed;
	}
}
