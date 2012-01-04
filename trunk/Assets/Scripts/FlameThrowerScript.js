#pragma strict
@script RequireComponent(Weapon)

public var damZone:DamageZone;
public var particleEffect : GameObject;
public var collisionPrefab : GameObject;
public var particleFire : ParticleEmitter;
public var particleSmoke : ParticleEmitter;
public var particleGlow : ParticleRenderer;
public var particleGun : ParticleEmitter;

private var weapon:Weapon;
private var spawnPoint:Transform;

private var offset:float;//the distance between weapon spawnPoint (graphical) and actual raycast origin
function Awake(){
	//damZone = GetComponent(DamageZone);
	weapon = GetComponent(Weapon);
	spawnPoint = weapon.spawnPoint;
	(damZone.collider as CapsuleCollider).height = weapon.range;
	SetFlameEnable(false);
	interval = 1 / collisionFrequency;
}

function SetFlameRange(range : float)
{
	// muscular mode activated.
	
	var scale:float = range / 16f;
	/*particleFire.minEnergy = 0.6f * scale;
	particleFire.maxEnergy = 0.8f * scale;
	var animator : ParticleAnimator = particleFire.gameObject.GetComponent(ParticleAnimator) as ParticleAnimator;
	animator.sizeGrow = 10f * scale;
	
	particleSmoke.minEnergy = 1f * scale;
	particleSmoke.maxEnergy = 1.3f * scale;
	animator = particleSmoke.gameObject.GetComponent(ParticleAnimator) as ParticleAnimator;
	animator.sizeGrow = 6 * scale;*/
	
	particleGlow.lengthScale = -3f * scale;
	
	offset = (spawnPoint.position - damZone.raycast.GetOrigin()).magnitude;
	var fireEnergy:float = ((range - offset - particleFire.maxSize/*- particleFire.maxSize*particleFire.sizeGrow*/)/ 
		particleFire.localVelocity.magnitude);
	particleFire.minEnergy = fireEnergy * 0.9;
	particleFire.maxEnergy = fireEnergy * 1.0;
	var smokeEnergy:float = ((range - offset)/ particleSmoke.localVelocity.magnitude);
	particleSmoke.minEnergy = smokeEnergy * 0.9;
	particleSmoke.maxEnergy = smokeEnergy * 1.0;
}

private var firing:boolean = true;//so that it can be turn off at start!
function SetFlameEnable(b:boolean):void{
	if (b==firing) return;
	firing = b;
	
	//if (b == damZone.enabled) return;
	
	damZone.gameObject.active = b;//this is needed to disable the collider
	damZone.enabled = b;
	
	for (var p: ParticleEmitter in particleEffect.GetComponentsInChildren(ParticleEmitter)) {
		p.emit = b;
	}
	
	particleGun.emit = !b;
}
public var collisionFrequency:float = 20;
private var interval:float;
private var lastFireTime:float = -1;
//private var startFireTime:float = -1;
function OnLaunchBullet(){
	//if (!firing) startFireTime = Time.time;
	SetFlameEnable(true);
	var hit : RaycastHit  = damZone.raycast.GetHitInfo();
	//var range:float = damZone.raycast.GetHitInfo().transform?damZone.raycast.GetHitInfo().distance:weapon.range;
	var range : float = hit.transform ? hit.distance : weapon.range;
	//Debug.Log(range);
	SetFlameRange(range);
	if ( (Time.time > lastFireTime + interval) && //time from last spawn
		collisionPrefab != null && hit.transform)
	{
		lastFireTime = Time.time;
		//Debug.Log(hit.transform.position);
		createFireCollision(particleFire.maxEnergy, hit.point, hit.normal);
	}
}

private function createFireCollision(time:float, pos:Vector3, normal:Vector3){
	yield WaitForSeconds(time);
	Instantiate (collisionPrefab, pos, Quaternion.LookRotation(normal, Vector3.up));
}

function OnStopFiring(){
	SetFlameEnable(false);
}

function Update(){
	var forward:Vector3 = weapon.owner.transform.forward;
	forward.y = 0;
	spawnPoint.rotation = Quaternion.LookRotation(Vector3.up, forward);
	
}

