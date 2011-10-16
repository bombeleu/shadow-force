#pragma strict
public var character : Transform;
public var cursorPlaneHeight : float = 0;
public var weaponHoldPoint : Transform;
//public var spawnPoint : Transform;

//public var weapons: MonoScript[];
public var weapons: Weapon[];
private var curWeapon: int = 0;

private var ws: Weapon[];


private var playerMovementPlane : Plane;


function Awake(){
	ws = new Weapon[weapons.length];
	//ws[0] =( ScriptableObject.CreateInstance(weapons[0].GetClass()) as Weapon);
	//ws[0].saySth();
	for (var i:int = 0;i<weapons.length; i++){
		ws[i] = Instantiate(weapons[i], weaponHoldPoint.position, weaponHoldPoint.rotation);
		ws[i].transform.parent = weaponHoldPoint;
		ws[i].SetEnable(false);

		//ws[0] = go.GetComponent.<Weapon>();
	}
	
	
	playerMovementPlane = new Plane (character.up, character.position + character.up * cursorPlaneHeight);
	altFireTimer = Time.time;
	lastWeaponSwitch = Time.time;
}

public static function PlaneRayIntersection (plane : Plane, ray : Ray) : Vector3 {
	var dist : float;
	plane.Raycast (ray, dist);
	return ray.GetPoint (dist);
}

public static function ScreenPointToWorldPointOnPlane (screenPoint : Vector3, plane : Plane, camera : Camera) : Vector3 {
	// Set up a ray corresponding to the screen position
	var ray : Ray = camera.ScreenPointToRay (screenPoint);
	
	// Find out where the ray intersects with the plane
	return PlaneRayIntersection (plane, ray);
}

private var altFireTimer:float = 0;
private var bufferedShot:int = 0;

private var firing:boolean = false;
private var lastWeaponSwitch:float = -1;
private var isFiring:boolean=false;
function Update () {
	//return;
	//this is only needed if the terrain is uneven!
	playerMovementPlane.normal = character.up;
	playerMovementPlane.distance = -character.position.y + cursorPlaneHeight;

	// On PC, the cursor point is the mouse position
	var cursorScreenPosition : Vector3 = Input.mousePosition;
	
	// Find out where the mouse ray intersects with the movement plane of the player
	var cursorWorldPosition : Vector3 = ScreenPointToWorldPointOnPlane (cursorScreenPosition, playerMovementPlane, Camera.main);

	var weapon : Weapon = ws[curWeapon];
	weapon.SetEnable(true);


	if (weapon.needPosition){
		//distance, direction take from mouse position
		//wait for the character rotation first
		//trigger the attack
	}else{
		//direction takes from mouse position
		//wait for the character rotation to trigger the attack on Fire1 or Fire2 axis possitive

		var angle:float = 0;
		#if UNITY_IPHONE || UNITY_ANDROID
			//isFiring = isFiring;
		#else
			var quat: Quaternion = Quaternion.FromToRotation( character.transform.rotation * Vector3.forward, 
				cursorWorldPosition - character.transform.position);
			var axis:Vector3;
			quat.ToAngleAxis(angle, axis);
			var fireAlt:float = Input.GetAxis("Fire1");
			isFiring = fireAlt>=1;
		#endif
		
		if (weapon.cooldown > 0){
			if (isFiring){
				bufferedShot=1;//maximum buffered 1 shot
			}
			if (bufferedShot>0 && angle<=3 && (Time.time - altFireTimer > 0.5)){
				bufferedShot = 0;
				//RPCFireMissile();
				//transform.SendMessage ("RPCFireMissile");
				altFireTimer = Time.time;
				
				weapon.gameObject.SendMessage("OnLaunchBullet");
			}
		}else{//continuous firing
			if (isFiring && (firing || angle<=3)){
				firing = true;
				weapon.gameObject.SendMessage("OnLaunchBullet");
			}else{
				firing = false;
				weapon.gameObject.SendMessage("OnStopFiring");
			}
		}
		//receiver.SendMessage ("OnStartFire");
	}
	var weaponSwitch:boolean;
	#if UNITY_IPHONE || UNITY_ANDROID
		weaponSwitch = (Input.acceleration.z <-0.9) || (Input.gyro.userAcceleration.z < -0.3);
	#else
		weaponSwitch = Input.GetAxis("Fire2")>=1;
	#endif
	if (weaponSwitch && Time.time > lastWeaponSwitch + weapon.switchTime){
		lastWeaponSwitch = Time.time;
		curWeapon = (curWeapon+1)%ws.length;
		weapon.renderer.enabled = false;
		weapon.SetEnable(false);
		weapon = ws[curWeapon];
		weapon.SetEnable(true);
	}
}
/*
function RPCFireMissile(){
	if (!networkView.isMine) return;
	if (Team.ammo<=0) return;
	networkView.RPC("FireMissile", RPCMode.All, [spawnPoint.position, spawnPoint.rotation]);
	//var go : GameObject = Network.Instantiate(missilePrefab, spawnPoint.position, spawnPoint.rotation, 0) as GameObject;
	Team.ammo--;
}*/

public var missilePrefab:GameObject;

//*
@RPC
function FireMissile(pos : Vector3, quat : Quaternion){
	var go : GameObject = Instantiate (missilePrefab, pos, quat);
}//*/


function OnStartFire(){
	isFiring = true;
	//Debug.Log("isFiring");
}

function OnStopFire(){
	isFiring = false;
}