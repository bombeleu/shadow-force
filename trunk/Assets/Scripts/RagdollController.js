#pragma strict

public var ragDoll : GameObject;
public var rootRagDoll : GameObject;
public var animationObject : GameObject;
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
			//DieByExplosion(transform.position + Vector3(1,0,0));
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
	
	// copy transforms
    CopyTransforms(animationObject.transform,ragDoll.transform);
    activated = true;
}

public function DieByForce(force : Vector3)
{
	Die();
	var go : GameObject = ragDoll.Find("Bip01");
	Debug.Log(go);
	
	//ragDoll.Find("Bip01").rigidbody.AddForce(forceDir * force,ForceMode.Impulse);
	rootRagDoll.rigidbody.AddForce(force,ForceMode.Impulse);
}

public function DieByExplosion(explosionPos : Vector3, explolsionRadius : Vector3)
{
	Die();
	//rootRagDoll.rigidbody.AddExplosionForce(forceDir*force,explosionPos,explosioRadius,2.0,ForceMode.Impulse);
}
