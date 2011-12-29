#pragma strict
@script RequireComponent(Weapon)

public var damZone:DamageZone;
public var particleEffect : GameObject;

private var weapon:Weapon;
private var spawnPoint:Transform;
function Awake(){
	//damZone = GetComponent(DamageZone);
	weapon = GetComponent(Weapon);
	spawnPoint = weapon.spawnPoint;
	(damZone.collider as CapsuleCollider).height = weapon.range;
	SetFlameEnable(false);
}

function SetFlameRange()
{

}

function SetFlameEnable(b:boolean):void{
    // fixed warnings
	//damZone.active = b;
	damZone.enabled = b;
	
	for (var p: ParticleEmitter in particleEffect.GetComponentsInChildren(ParticleEmitter)) {
		p.emit = b;
	}
}

function OnLaunchBullet(){
	SetFlameEnable(true);
}

function OnStopFiring(){
	SetFlameEnable(false);
}

function Update(){
	var forward:Vector3 = weapon.owner.transform.forward;
	forward.y = 0;
	spawnPoint.rotation = Quaternion.LookRotation(Vector3.up, forward);
}

