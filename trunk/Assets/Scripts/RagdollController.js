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

function Update () 
{
	if (debug)
	{
		if (Input.GetKeyDown(KeyCode.T)) {
			ResetAnimation();
		} else if (Input.GetKeyDown(KeyCode.G)) {
			Die();
		} else if (Input.GetKeyDown(KeyCode.H)) {
			DieByForce(Vector3.up, 500.0);
		} else if (Input.GetKeyDown(KeyCode.J)) {
			//DieByExplosion(transform.position + Vector3(1,0,0));
		} else if (Input.GetKeyDown(KeyCode.P)) {
			var temp : FadingEffect = GetComponent(FadingEffect);
			Debug.Log(temp);
			temp.FadeOut() ;
		}
	}
}

function RecursiveDeepActivation(trans : Transform)
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
	
	// enable visiont mesh
	gameObject.GetComponentInChildren.<VisionMeshScript>().TurnOn();
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
}

public function DieByForce(forceDir : Vector3, force : float)
{
	Die();
	var go : GameObject = ragDoll.Find("Bip01");
	Debug.Log(go);
	
	//ragDoll.Find("Bip01").rigidbody.AddForce(forceDir * force,ForceMode.Impulse);
	rootRagDoll.rigidbody.AddForce(forceDir*force,ForceMode.Impulse);
}

public function DieByExplosion(explosionPos : Vector3, explolsionRadius : Vector3)
{
	Die();
	//rootRagDoll.rigidbody.AddExplosionForce(forceDir*force,explosionPos,explosioRadius,2.0,ForceMode.Impulse);
}
