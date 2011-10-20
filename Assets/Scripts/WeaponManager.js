#pragma strict
@script RequireComponent (NetworkView)

private var character : Transform;
public var cursorPlaneHeight : float = 0;
public var weaponHoldPoint : Transform;
//public var spawnPoint : Transform;

//public var weapons: MonoScript[];
public var weapons: Weapon[];
private var curWeapon: int = 0;

private var ws: Weapon[];


private var playerMovementPlane : Plane;


function Awake(){
	character = transform;
	ws = new Weapon[weapons.length];
	//ws[0] =( ScriptableObject.CreateInstance(weapons[0].GetClass()) as Weapon);
	//ws[0].saySth();
	for (var i:int = 0;i<weapons.length; i++){
		ws[i] = Instantiate(weapons[i], weaponHoldPoint.position, weaponHoldPoint.rotation);
		ws[i].transform.parent = weaponHoldPoint;
		ws[i].SetEnable(false);

		if (networkView.isMine && ws[i].networkView)
			networkView.RPC("RPCSetWeaponViewID", RPCMode.AllBuffered, [i, Network.AllocateViewID()]);
		//ws[0] = go.GetComponent.<Weapon>();
	}
	
	
	playerMovementPlane = new Plane (character.up, character.position + character.up * cursorPlaneHeight);
	altFireTimer = Time.time;
	lastWeaponSwitch = Time.time;
}

@RPC
function RPCSetWeaponViewID(weaponID:int, viewID:NetworkViewID){
	ws[weaponID].networkView.viewID = viewID;
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
private var oldIsFiring: boolean = false;
function Update () {
	if (!networkView.isMine) return;//weapon manager only updates the local player, network update is done per weapon basis
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

	//direction takes from mouse position
	//wait for the character rotation to trigger the attack on Fire1 or Fire2 axis possitive
	var angle:float;
	#if UNITY_IPHONE || UNITY_ANDROID
		angle = 0;//TODO: compute angle base on the different between angle and joystick
	#else
		var quat: Quaternion = Quaternion.FromToRotation( character.transform.rotation * Vector3.forward, 
			cursorWorldPosition - character.transform.position);
		var axis:Vector3;
		quat.ToAngleAxis(angle, axis);
		var fireAlt:float = Input.GetAxis("Fire1");
		oldIsFiring = isFiring;
		isFiring = fireAlt>=1;
	#endif
	
	if (weapon.cooldown > 0){
		if (!oldIsFiring && isFiring){
			bufferedShot=1;//maximum buffered 1 shot
		}
		if ((bufferedShot>0 || isFiring) && angle<=3 && (Time.time - altFireTimer > 0.5)){
			bufferedShot = 0;
			//RPCFireMissile();
			//transform.SendMessage ("RPCFireMissile");
			altFireTimer = Time.time;
			if (weapon.needPosition){
				weapon.gameObject.SendMessage("OnLaunchBullet", cursorWorldPosition);
			}else{
				weapon.gameObject.SendMessage("OnLaunchBullet");
			}
		}
	}else{//continuous firing
		if (isFiring && (firing || angle<=3)){
			firing = true;
			if (weapon.needPosition){
				weapon.gameObject.SendMessage("OnLaunchBullet", cursorWorldPosition);
			}else{
				weapon.gameObject.SendMessage("OnLaunchBullet");
			}
		}else{
			firing = false;
			weapon.gameObject.SendMessage("OnStopFiring");
		}
	}
	
	var weaponSwitch:boolean;
	#if UNITY_IPHONE || UNITY_ANDROID
		if (Input.isGyroAvailable)
			weaponSwitch = Input.gyro.userAcceleration.z < -0.5;
		else
			weaponSwitch = Input.acceleration.z <-0.9;
	#else
		weaponSwitch = Input.GetAxis("Fire2")>=1;
	#endif
	if (weaponSwitch && Time.time > lastWeaponSwitch + weapon.switchTime){
		lastWeaponSwitch = Time.time;
		RPCWeaponSwitch((curWeapon+1)%ws.length);//use networkView to control weapon sync
	}
}

function OnSerializeNetworkView (stream : BitStream, info : NetworkMessageInfo) {
	/*var horizontalInput : float = 0.0;
	if (stream.isWriting) {
		// Sending
		horizontalInput = Input.GetAxis ("Horizontal");
		stream.Serialize (horizontalInput);
	} else {
		// Receiving
		stream.Serialize (horizontalInput);
		// ... do something meaningful with the received variable
	}*/
	if (stream.isWriting){
		stream.Serialize(curWeapon);
	}else{
		var newWeapon:int;
		stream.Serialize(newWeapon);
		RPCWeaponSwitch(newWeapon);
	}
}

@RPC
function RPCWeaponSwitch(newWeapon:int){
	ws[curWeapon].SetEnable(false);
	ws[newWeapon].SetEnable(true);
	curWeapon = newWeapon;
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