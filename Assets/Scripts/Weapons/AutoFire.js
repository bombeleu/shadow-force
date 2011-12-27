#pragma strict

@script RequireComponent (PerFrameRaycast)

var bulletPrefab : GameObject;
var missilePrefab : GameObject;
var spawnPoint : Transform;
var frequency : float = 10;
var coneAngle : float = 1.5;
var firing : boolean = false;
var damagePerSecond : float = 20.0;
var forcePerSecond : float = 60.0;
var hitSoundVolume : float = 0.5;

var muzzleFlashFront : GameObject;
var myPlayer: GameObject;

private var lastFireTime : float = -1;
private var raycast : PerFrameRaycast;

function Awake () {
	muzzleFlashFront.active = false;
	
	raycast = GetComponent.<PerFrameRaycast> ();
	if (spawnPoint == null)
		spawnPoint = transform;
	
	altFireCooldownTimer = 0;
}

public var altFireCooldown : float = 0.5;
private var altFireCooldownTimer : float;

function Update () {
	if (firing) {
		
		if (Time.time > lastFireTime + 1 / frequency) {
			// Spawn visual bullet
			var coneRandomRotation = Quaternion.Euler (Random.Range (-coneAngle, coneAngle), Random.Range (-coneAngle, coneAngle), 0);
			var go : GameObject = Spawner.Spawn (bulletPrefab, spawnPoint.position, spawnPoint.rotation * coneRandomRotation) as GameObject;
			var bullet : SimpleBullet = go.GetComponent.<SimpleBullet> ();
			
			lastFireTime = Time.time;
			
			// Find the object hit by the raycast
			var hitInfo : RaycastHit = raycast.GetHitInfo ();
			if (hitInfo.transform) {
				// Get the health component of the target if any
				var targetHealth : Health = hitInfo.transform.GetComponent.<Health> ();
				if (targetHealth) {
					// Apply damage
					if (NetworkU.IsMine(this)){//only apply damage if this is MY character!
						NetworkU.RPC(targetHealth, "OnDamage", NetRPCMode.All, 
							[damagePerSecond / frequency, -spawnPoint.forward]);
					}
					//targetHealth.OnDamage (damagePerSecond / frequency, -spawnPoint.forward);
				}
				
				// Get the rigidbody if any
				if (hitInfo.rigidbody) {
					// Apply force to the target object at the position of the hit point
					var force : Vector3 = transform.forward * (forcePerSecond / frequency);
					hitInfo.rigidbody.AddForceAtPosition (force, hitInfo.point, ForceMode.Impulse);
				}
				
				// Ricochet sound
				var sound : AudioClip = MaterialImpactManager.GetBulletHitSound (hitInfo.collider.sharedMaterial);
				AudioSource.PlayClipAtPoint (sound, hitInfo.point, hitSoundVolume);
				
				bullet.dist = hitInfo.distance;
			}
			else {
				bullet.dist = 1000;
			}
		}
	}
	var fireAlt:float = Input.GetAxis("Fire2");
	if (fireAlt	>=1 && altFireCooldownTimer <= 0){
		RPCFireMissile();
		altFireCooldownTimer = altFireCooldown;
	}
	altFireCooldownTimer -= Time.deltaTime;
}

function RPCFireMissile(){
	if (!NetworkU.IsMine(this)) return;
	if (Team.ammo<=0) return;
	NetworkU.RPC(this, "FireMissile", NetRPCMode.All, [spawnPoint.position, spawnPoint.rotation]);
	//var go : GameObject = Network.Instantiate(missilePrefab, spawnPoint.position, spawnPoint.rotation, 0) as GameObject;
	Team.ammo--;
}

//*
#if !UNITY_FLASH
@RPC
#endif
function FireMissile(pos : Vector3, quat : Quaternion){
	var go : GameObject = Instantiate (missilePrefab, pos, quat);
}//*/

function RPCOnStartFire(){
	/*
	var player : GameObject = myPlayer;
	var controller : PlayerMoveController;
	controller = player.GetComponent("PlayerMoveController");
	//controller.character = character.transform;
	if (controller.myPlayer != Network.player.guid) return;
	//*/
	if (!NetworkU.IsMine(this)) return;
	
	NetworkU.RPC(this, "OnStartFire", NetRPCMode.All);
}

function RPCOnStopFire(){
	if (!NetworkU.IsMine(this)) return;
	
	NetworkU.RPC(this, "OnStopFire", NetRPCMode.All);
}

#if !UNITY_FLASH
@RPC
#endif

function OnStartFire () {

	if (Time.timeScale == 0)
		return;
	
	firing = true;
	
	muzzleFlashFront.active = true;
	
	if (audio)
		audio.Play ();
}

#if !UNITY_FLASH
@RPC
#endif

function OnStopFire () {
	firing = false;
	
	muzzleFlashFront.active = false;
	
	if (audio)
		audio.Stop ();
}