@script RequireComponent (Weapon)

private var hitDistance:float=0;
function GetHitDistance(){
	return hitDistance;
}

private var spawnPoint:Transform;
function Awake(){
	spawnPoint = GetComponent.<Weapon>().spawnPoint;
}

function OnLaunchBullet(){
	// Cast a ray to find out the end point of the laser
	var hitInfo : RaycastHit = RaycastHit ();
	Physics.Raycast (spawnPoint.position, spawnPoint.forward, hitInfo);
	
	/*var bulletPrefab = GetComponent.<Weapon>().bulletPrefab;
	var go : GameObject = Spawner.Spawn (bulletPrefab, spawnPoint.position, spawnPoint.rotation) as GameObject;
	var bullet : SimpleBullet = go.GetComponent.<SimpleBullet> ();*/
	
	if (hitInfo.transform) {
		// Get the health component of the target if any
		var targetHealth : Health = hitInfo.transform.GetComponent.<Health> ();
		/*if (targetHealth) {
			// Apply damage
			if (networkView.isMine){//only apply damage if this is MY character!
				hitInfo.transform.networkView.RPC("OnDamage", RPCMode.All, 
					[damagePerSecond / frequency, -spawnPoint.forward]);
			}
			//targetHealth.OnDamage (damagePerSecond / frequency, -spawnPoint.forward);
		}*/
		
		// Get the rigidbody if any
		/*if (hitInfo.rigidbody) {
			// Apply force to the target object at the position of the hit point
			var force : Vector3 = transform.forward * (forcePerSecond / frequency);
			hitInfo.rigidbody.AddForceAtPosition (force, hitInfo.point, ForceMode.Impulse);
		}
		
		// Ricochet sound
		var sound : AudioClip = MaterialImpactManager.GetBulletHitSound (hitInfo.collider.sharedMaterial);
		AudioSource.PlayClipAtPoint (sound, hitInfo.point, hitSoundVolume);
		*/
		
		hitDistance = hitInfo.distance;
		
		//SendMessage("OnBulletHit");//this is the duty of bullet
	}
	else {
		hitDistance = 1000;
	}
}

function OnStopFiring(){
	
}