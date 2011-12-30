#pragma strict
@script RequireComponent(Weapon)

public var damZone:DamageZone;
public var particleEffect : GameObject;
public var collisionPrefab : GameObject;
public var particleFire : ParticleEmitter;
public var particleSmoke : ParticleEmitter;
public var particleGlow : ParticleRenderer;

private var weapon:Weapon;
private var spawnPoint:Transform;
function Awake(){
	//damZone = GetComponent(DamageZone);
	weapon = GetComponent(Weapon);
	spawnPoint = weapon.spawnPoint;
	(damZone.collider as CapsuleCollider).height = weapon.range;
	SetFlameEnable(false);
}

function SetFlameRange(range : float)
{
	// muscular mode activated.
	
	var scale:float = range / 16f;
	particleFire.minEnergy = 0.6f * scale;
	particleFire.maxEnergy = 0.8f * scale;
	var animator : ParticleAnimator = particleFire.gameObject.GetComponent(ParticleAnimator) as ParticleAnimator;
	animator.sizeGrow = 10f * scale;
	
	particleSmoke.minEnergy = 1f * scale;
	particleSmoke.maxEnergy = 1.3f * scale;
	animator = particleSmoke.gameObject.GetComponent(ParticleAnimator) as ParticleAnimator;
	animator.sizeGrow = 6 * scale;
	
	particleGlow.lengthScale = -3f * scale;
}

function SetFlameEnable(b:boolean):void{
	
	if (b == damZone.enabled) return;
	
	damZone.gameObject.active = b;//this is needed to disable the collider
	damZone.enabled = b;
	
	for (var p: ParticleEmitter in particleEffect.GetComponentsInChildren(ParticleEmitter)) {
		p.emit = b;
	}
}

private var interval:float = 1/5;
private var lastFireTime:float = -1;
function OnLaunchBullet(){
	SetFlameEnable(true);
	var hit : RaycastHit  = damZone.raycast.GetHitInfo();
	//var range:float = damZone.raycast.GetHitInfo().transform?damZone.raycast.GetHitInfo().distance:weapon.range;
	var range : float = hit.transform ? hit.distance : weapon.range;
	//Debug.Log(range);
	SetFlameRange(range);
	if ((Time.time > lastFireTime + interval) && collisionPrefab != null && hit.transform)
	{
		lastFireTime = Time.time;
		//Debug.Log(hit.transform.position);
		Instantiate (collisionPrefab, hit.point, Quaternion.LookRotation(hit.normal, Vector3.up));
	}
}

function OnStopFiring(){
	SetFlameEnable(false);
}

function Update(){
	var forward:Vector3 = weapon.owner.transform.forward;
	forward.y = 0;
	spawnPoint.rotation = Quaternion.LookRotation(Vector3.up, forward);
	
}

