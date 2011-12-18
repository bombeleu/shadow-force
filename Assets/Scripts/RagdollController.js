#pragma strict

public var ragDoll : GameObject;
public var rootRagDoll : GameObject;
public var animationObject : GameObject;
public var weaponHoldPoint : Transform;
public var attachedObjects : GameObject[];
public var debug : boolean;

public var activated : boolean = false;

function Start()
{
	if (debug) Debug.Log("Ragdoll controller started");
	ResetAnimation();
}
private function RecursiveIgnoreRagdollCollision(trans : Transform)
{
	if (trans.collider != null) 
	{
		Physics.IgnoreCollision(trans.collider,gameObject.collider);
		//Debug.Log(trans.collider);
		trans.rigidbody.velocity = Vector3.zero;
	}
	for(var t : Transform in trans)
	{
		RecursiveIgnoreRagdollCollision (t);
	}
}

function Update () 
{
	if (debug)
	{
		if (Input.GetKeyDown(KeyCode.T)) {
			ResetAnimation();
		} else if (Input.GetKeyDown(KeyCode.G)) {
			Die();
		} else if (Input.GetKeyDown(KeyCode.H)) {
			DieByForce(Vector3.back * 500.0);
		} else if (Input.GetKeyDown(KeyCode.J)) {
			DieByExplosion(1000f,transform.position + Vector3(3,0,0),20f);
		} else if (Input.GetKeyDown(KeyCode.P)) {
			var temp : VisibleBucket = GetComponent(VisibleBucket);
			Debug.Log(temp);
			temp.OnSetVisible(false);
		}
	}
}

private function RecursiveDeepActivation(trans : Transform)
{
	trans.gameObject.active = true;
	for(var t : Transform in trans)
	{
		RecursiveDeepActivation (t);
	}
}

public function ResetAnimation()
{
	activated = false;
	// disable Ragdoll
	ragDoll.GetComponentInChildren.<SkinnedMeshRenderer>().enabled = false;
	ragDoll.SetActiveRecursively(false);
	
	// enable animation
	animationObject.GetComponentInChildren.<SkinnedMeshRenderer>().enabled = true;
	animationObject.animation.enabled = true;

	// enabled collider in gameobject
	gameObject.collider.enabled = true;
	
	// enable visiont mesh
	gameObject.GetComponentInChildren.<VisionMeshScript>().TurnOn();
	
	// adjust blob
	for (var go : GameObject in attachedObjects)
	{
		go.transform.parent = gameObject.transform;
	}   
}

private function CopyTransforms(src : Transform, dest : Transform)
{
    // error checking
    if (!src || !dest)
    {
    	Debug.Log("Copy transform, parameter is NULL");
        return;
    }

    // copy position
    dest.localPosition = src.localPosition;
    // copy rotation
    dest.localRotation = src.localRotation;
    // copy scale
    dest.localScale = src.localScale;

	//Debug.Log(src);
    // copy children
    for(var sc : Transform in src)
    {
        var dc : Transform = dest.Find(sc.name);

        if (dc)
            CopyTransforms(sc, dc);
    }
}
    
public function Die()
{
	if (debug) Debug.Log("Ragdoll die activated");
	activated = true;
	// first Kill Animation
	animationObject.animation.Stop();
	animationObject.animation.enabled = false;
	animationObject.GetComponentInChildren.<SkinnedMeshRenderer>().enabled = false;

	// disabled vision mesh
	gameObject.GetComponentInChildren.<VisionMeshScript>().TurnOff();
		
	// then activate ragdoll
	RecursiveDeepActivation(ragDoll.transform);
	ragDoll.GetComponentInChildren.<SkinnedMeshRenderer>().enabled = true;
	
	RecursiveIgnoreRagdollCollision(ragDoll.transform);
	gameObject.rigidbody.Sleep();
	
	// copy transforms
    CopyTransforms(animationObject.transform,ragDoll.transform);

    // detach weapon
    var weapons : Weapon[] = gameObject.GetComponentsInChildren.<Weapon>();
    if (weaponHoldPoint)
    {
	    for (var wp : Weapon in weapons)
	    {
	    	Debug.Log(wp);
	    	wp.SetDead();
	    	wp.transform.parent = weaponHoldPoint;
	    }
    }
    // adjust blob
	for (var go : GameObject in attachedObjects)
	{
		go.transform.parent = rootRagDoll.transform;
	}    
    
    //destroy the object, will recreate at respawn
    ragDoll.transform.parent = null;
    DestroyObject(gameObject);
    
   	//DestroyObject(animationObject);
    //ragDoll.transform.parent = null;
    
    //Instantiate(ragDoll,ragDoll.transform.position, ragDoll.transform.rotation);
    //Destroy(gameObject);
    
    // disable player control
    //GetComponent(PlayerMoveController).enabled = false;
}

public function DieByForce(force : Vector3) // absolute direction
{
	Debug.Log("die force"+force);
	Die();
	
	rootRagDoll.rigidbody.AddForce(force,ForceMode.Impulse);
	
	// use this for relative force
	//rootRagDoll.rigidbody.AddRelativeForce(force,ForceMode.Impulse);
}

public function DieSignal():void{
	/*if (GetComponent(PlayerMoveController))
		GetComponent(PlayerMoveController).enabled = false;//TODO:re-enable on respawn!
	if (GetComponent(AICentral))
		GetComponent(AICentral).enabled = false;
	if (GetComponent(AutoShoot))
		GetComponent(AutoShoot).enabled = false;

	GetComponent(MovementMotor).movementDirection = Vector3.zero;*/
	
	DieByForce(GetComponent(Health).damageForce*100);

}

public function DieByExplosion(force : float, explosionPos : Vector3, explosionRadius : float)
{
	Die();
	//rootRagDoll.rigidbody.AddExplosionForce(
	rootRagDoll.rigidbody.AddExplosionForce(force,explosionPos,explosionRadius,10.0,ForceMode.Impulse);
}
