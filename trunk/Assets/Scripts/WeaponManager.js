#pragma strict
@script RequireComponent (NetworkView)

//private var character : Transform;
public var cursorPlaneHeight : float = 0;
public var weaponHoldPoint : Transform;

public var controllable:boolean = true;

//public var spawnPoint : Transform;

//public var weapons: MonoScript[];
public var weapons: Weapon[];
private var curWeapon: int = 0;
private var ws: Weapon[];

private var playerMovementPlane : Plane;

function OnEnable(){
	//character = transform;
	ws = new Weapon[weapons.length];
	//ws[0] =( ScriptableObject.CreateInstance(weapons[0].GetClass()) as Weapon);
	//ws[0].saySth();
	for (var i:int = 0;i<weapons.length; i++){
		ws[i] = Instantiate(weapons[i], weaponHoldPoint.position, weaponHoldPoint.rotation);
		ws[i].transform.parent = weaponHoldPoint;
		ws[i].owner = transform;
		ws[i].SetEnable(false);

		if (networkView.isMine && ws[i].networkView)
			networkView.RPC("RPCSetWeaponViewID", RPCMode.AllBuffered, [i, Network.AllocateViewID()]);
		//ws[0] = go.GetComponent.<Weapon>();
	}
	
	//cursorPlaneHeight = -character.position.y;
	//playerMovementPlane = new Plane (character.up, Vector3(character.position.x,0,character.position.z) + character.up * cursorPlaneHeight);
}

private var weaponGUI:SelectWeaponGUI;
function Awake(){
	weaponGUI = GameObject.FindObjectOfType(SelectWeaponGUI);
	playerMovementPlane = new Plane (transform.up, transform.position + transform.up * cursorPlaneHeight);
}

function SetWeaponSelection(){
	var params:Object[] = new Object[2];
	params[0] = weaponGUI.selectedWeapons[0];
	params[1] = weaponGUI.selectedWeapons[1];
	networkView.RPC("_SetWeaponSelection", RPCMode.AllBuffered, params);
}

@RPC
function _SetWeaponSelection(weapon0:int, weapon1:int):void{
	weapons = new Weapon[2];
	weapons[0] = weaponGUI.availableWeapons[weapon0];
	weapons[1] = weaponGUI.availableWeapons[weapon1];
	this.enabled = true;
}

@RPC
function RPCSetWeaponViewID(weaponID:int, viewID:NetworkViewID){
	//Debug.Log("RPC Set WeaponViewID " + weaponID + "..." + viewID);
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
private var joystickPos:Vector3;

private var manualFire:boolean = false;
private var manualPos:Vector3;

function OnSetVisible(visi:boolean){
	/*for (var weapon:Weapon in ws)
		weapon.SetEnable(false);*/
	ws[curWeapon].SetEnable(visi);
}

function WeaponStartFire(pos:Vector3){
	manualFire = true;
	manualPos = pos;
}

function WeaponStopFire(){
	manualFire = false;
}

function Start(){
	ws[curWeapon].SetEnable(true);
	altFireTimer = Time.time;
	lastWeaponSwitch = Time.time;
}

public var playerAnimation : PlayerAnimation;

function Update () {
	if (!networkView.isMine) return;//weapon manager only updates the local player, network update is done per weapon basis

	//return;
	//this is only needed if the terrain is uneven!
	playerMovementPlane.normal = transform.up;
	playerMovementPlane.distance = -transform.position.y + cursorPlaneHeight;

	var cursorWorldPosition : Vector3;

	var weapon : Weapon = ws[curWeapon];
	//weapon.SetEnable(true);

	//direction takes from mouse position
	//wait for the character rotation to trigger the attack on Fire1 or Fire2 axis possitive
	var angle:float;
	oldIsFiring = isFiring;
	if (!controllable){
		isFiring = manualFire;
		if (manualFire) cursorWorldPosition = manualPos;
	}else{
		#if UNITY_IPHONE || UNITY_ANDROID
			//angle = 0;//TODO: compute angle base on the different between angle and joystick
			cursorWorldPosition = transform.position + transform.forward * Vector3(joystickPos.x,0,joystickPos.y).magnitude * 10;
		#else
			// On PC, the cursor point is the mouse position
			var cursorScreenPosition : Vector3 = Input.mousePosition;
			// Find out where the mouse ray intersects with the movement plane of the player
			cursorWorldPosition = ScreenPointToWorldPointOnPlane (cursorScreenPosition, playerMovementPlane, Camera.main);
	
			var fireAlt:float = Input.GetAxis("Fire1");
			isFiring = fireAlt>=1;
		#endif
		if (weapon.needPositionUpdate){
			weapon.gameObject.SendMessage("OnUpdateTarget", cursorWorldPosition);
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
	var fromV:Vector3 = transform.rotation * Vector3.forward;
	var toV:Vector3 = cursorWorldPosition - transform.position;
	toV.y = fromV.y;
	var quat: Quaternion = Quaternion.FromToRotation( fromV, toV);
	var axis:Vector3;
	quat.ToAngleAxis(angle, axis);

	if (weapon.cooldown > 0){
		if (!oldIsFiring && isFiring){
			bufferedShot=1;//maximum buffered 1 shot
		}
		if ((bufferedShot>0 || isFiring) && angle<=3 && (Time.time - altFireTimer > weapon.cooldown)){
			bufferedShot = 0;
			//RPCFireMissile();
			//transform.SendMessage ("RPCFireMissile");
			altFireTimer = Time.time;
			if (weapon.needPosition){
				weapon.gameObject.SendMessage("OnLaunchBullet", cursorWorldPosition);
				isFiring = false;
			}else{
				weapon.gameObject.SendMessage("OnLaunchBullet");
			}
			networkView.RPC("onetimeFireAnimation", RPCMode.All);
		}
	}else{//continuous firing
		if (isFiring && (firing || angle<=3)){
			if (!firing) networkView.RPC("startFireAnimation", RPCMode.All);
			firing = true;
			if (weapon.needPosition){
				weapon.gameObject.SendMessage("OnLaunchBullet", cursorWorldPosition);
			}else{
				weapon.gameObject.SendMessage("OnLaunchBullet");
			}
		}else{
			if (firing) networkView.RPC("stopFireAnimation", RPCMode.All);
			firing = false;
			weapon.gameObject.SendMessage("OnStopFiring");
		}
	}
}

@RPC
function startFireAnimation(){
	Debug.Log('start fire!');
	playerAnimation.OnStartFire();
}

@RPC
function stopFireAnimation(){
	Debug.Log('stop fire!');
	playerAnimation.OnStopFire();
}

@RPC
function onetimeFireAnimation(){
	playerAnimation.OnStartFire();
	yield WaitForSeconds(playerAnimation.shootingTime);
	playerAnimation.OnStopFire();
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
	Debug.Log("RPC Switch weapon " + newWeapon);
	ws[curWeapon].SetEnable(false);
	if (GetComponent.<Visibility>().GetVisible())
		ws[newWeapon].SetEnable(true);
	curWeapon = newWeapon;
	
	#if UNITY_IPHONE || UNITY_ANDROID
		if (networkView.isMine){
			if (ws[curWeapon].needPosition)
				gameObject.SendMessage("SetJoystickReset",true);
			else
				gameObject.SendMessage("SetJoystickReset",false);
		}
	#endif
}
@RPC
function RPCWeaponInialize() {
	Debug.Log("RPC Weapon Initalize");
}

function OnStartFire(){
	if (!ws[curWeapon].needPosition)
		isFiring = true;
	//Debug.Log("isFiring");
}

function OnStopFire(){
	if (!ws[curWeapon].needPosition)
		isFiring = false;
}

function OnUpdateTarget(pos:Vector3){
	joystickPos = pos;
}

function OnJoystickRelease(){
	isFiring = true;
}