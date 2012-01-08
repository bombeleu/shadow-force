#pragma strict
#if !UNITY_FLASH
@script RequireComponent (NetworkView)
#endif

//private var character : Transform;
public var cursorPlaneHeight : float = 0;
public var weaponHoldPoint : Transform;

public var controllable:boolean = true;

//public var spawnPoint : Transform;

//public var weapons: MonoScript[];
public var weapons: Weapon[];
public var hasShield:boolean = false;
public var shieldPrefab:Transform;

public var visiBucket:VisibleBucket;

private var curWeapon: int = 0;
private var ws: Weapon[];

private var playerMovementPlane : Plane;

// gui
public var ammoStyle : GUIStyle;
public var switchButtonStyle : GUIStyle;
//


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

		if (NetworkU.IsMine(this)/* && ws[i].networkView*/)
			#if UNITY_FLASH
			RPCSetWeaponViewID(i, NetworkU.AllocateID());
			#else
			NetworkU.RPC(this, "RPCSetWeaponViewID", NetRPCMode.AllBuffered, i, NetworkU.AllocateID());
			#endif
		//ws[0] = go.GetComponent.<Weapon>();
	}
	if (hasShield){
		var shield:Transform = Instantiate(shieldPrefab, Vector3.zero, Quaternion.identity);
		Physics.IgnoreCollision(shield.collider, collider, true);
		shield.parent = transform;
		shield.localPosition = Vector3(0,0,0.8);//equal to radius, so that weapon can shoot out!
		shield.localRotation = Quaternion.Euler(0, 180, 0);

		//Debug.Log("Child count:" + shield.childCount);
		//Debug.Log(shield.GetChild(0).gameObject);
		visiBucket.AddVisibleObject(shield.GetChild(0).gameObject); // hacking, 
		var blocker:BlockingAI = gameObject.AddComponent(BlockingAI);
		/*#if !UNITY_FLASH
		var dodger:DodgingAI = GetComponent(DodgingAI);
		if (dodger) Destroy(dodger);
		#endif*/
		var ai:AICentral = GetComponent(AICentral);
		if (ai){
			ai.blocker = blocker;
		}
		visiBucket.AddVisibleObject(shield.GetComponentInChildren(Renderer).gameObject);
	}
	if (controllable)
		autoShoot.enabled = ws[0].playerAutoShoot;
	
	//cursorPlaneHeight = -character.position.y;
	//playerMovementPlane = new Plane (character.up, Vector3(character.position.x,0,character.position.z) + character.up * cursorPlaneHeight);
}

private var weaponGUI:SelectWeaponGUI;
private var groundPlane:Plane;
function Awake(){
	weaponGUI = GameObject.FindObjectOfType(SelectWeaponGUI);
	visi = GetComponent(Visibility);
	playerMovementPlane = new Plane (transform.up, transform.position + transform.up * cursorPlaneHeight);
	groundPlane = new Plane (transform.up, Vector3.up * 0.5);//ground plane
}

function SetWeaponSelection(){
	var params:Object[] = new Object[2];
	params[0] = weaponGUI.selectedWeapons[0];
	params[1] = weaponGUI.selectedWeapons[1];
	#if UNITY_FLASH
	_SetWeaponSelection(params[0], params[1]);
	#else
	NetworkU.RPC(this, "_SetWeaponSelection", NetRPCMode.AllBuffered, params);
	#endif
}

#if !UNITY_FLASH
@RPC
#endif
function _SetWeaponSelection(weapon0:int, weapon1:int):void{
	weapons = new Weapon[2];
	weapons[0] = weaponGUI.availableWeapons[weapon0];
	weapons[1] = weaponGUI.availableWeapons[weapon1];
	this.enabled = true;
}

function RPCSetWeaponViewID(weaponID:int, viewID:NetViewID){
	//ws[weaponID].networkView.viewID = viewID;
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
private var hasPos:boolean;
private var manualPos:Vector3;

function OnSetVisible(visi:boolean){
	/*for (var weapon:Weapon in ws)
		weapon.SetEnable(false);*/
	//ws[curWeapon].SetEnable(visi);
}

function GetCurrentWeapon():Weapon{
	if (!ws || ws.Length == 0) return null;
	return ws[curWeapon];
}

function GetAllWeapons():Weapon[]{
	return ws;
}

public var autoShoot:AutoShoot;
private var autoShootAllow:boolean=true;
private var leaning:boolean;
function Lean(){
	if (leaning) return;
	leaning = true;
	autoShoot.enabled = false;
	manualFire = false;
}

function ExitLean(){
	if (!leaning) return;
	leaning = false;
	autoShoot.enabled = autoShootAllow;
}

function WeaponStartFire(pos:Vector3){
	//Debug.Log("Fire!!");
	manualFire = true;
	hasPos = true;
	manualPos = pos;
	manualPos.y = transform.position.y;
	if (controllable){
		GetComponent(PlayerMoveController).disableRotation = true;
	}
}

function WeaponStopFire(){
	manualFire = false;
	//Debug.Log("Stop fire");
	if (controllable){
		GetComponent(PlayerMoveController).disableRotation = false;
	}
}

function Start(){
	ws[curWeapon].SetEnable(true);
	altFireTimer = Time.time;
	lastWeaponSwitch = Time.time;
}

public var playerAnimation : PlayerAnimation;
private var visi:Visibility;
public var positionalLayers:LayerMask;

private var weaponSwitchGUI:boolean;
function Update () {
	if (!NetworkU.IsMine(this)) return;//weapon manager only updates the local player, network update is done per weapon basis

	var cursorWorldPosition : Vector3;

	var weapon : Weapon = ws[curWeapon];

	//return;
	//this is only needed if the terrain is uneven!
	playerMovementPlane.normal = transform.up;
	//playerMovementPlane.distance = -transform.position.y + cursorPlaneHeight;
	playerMovementPlane.distance = -weapon.spawnPoint.position.y;

	//weapon.SetEnable(true);

	//direction takes from mouse position
	//wait for the character rotation to trigger the attack on Fire1 or Fire2 axis possitive
	var angle:float;
	oldIsFiring = isFiring;
	if ((!controllable)||manualFire){
		isFiring = manualFire;
		if (manualFire && hasPos) cursorWorldPosition = manualPos;
	}else{
		var posCursor:Vector3;
		#if UNITY_IPHONE || UNITY_ANDROID
			//angle = 0;//TODO: compute angle base on the different between angle and joystick
			cursorWorldPosition = transform.position + transform.forward * Vector3(joystickPos.x,0,joystickPos.y).magnitude * 10;
			isFiring = manualFire;//TODO: allow manual control to override autoshoot
			posCursor = cursorWorldPosition;
			posCursor.y = 0.5;//TODO: remove hardcode
		#else
			// On PC, the cursor point is the mouse position
			var cursorScreenPosition : Vector3 = Input.mousePosition;
			// Find out where the mouse ray intersects with the movement plane of the player
			cursorWorldPosition = ScreenPointToWorldPointOnPlane (cursorScreenPosition, playerMovementPlane, Camera.main);
	
			var fireAlt:float = Input.GetAxis("Fire1");
			isFiring = (fireAlt>=1);
			posCursor = ScreenPointToWorldPointOnPlane (cursorScreenPosition, groundPlane, Camera.main);
		#endif
		var posHit:RaycastHit;
		Physics.Raycast(posCursor + Vector3.up*10, -Vector3.up, posHit, Mathf.Infinity, positionalLayers);
		var positionalTarget:Vector3 = controllable?
			((posHit.transform==null || posHit.point.y>cursorWorldPosition.y)?
			(posCursor - Vector3.up*50):posHit.point)://no abyss, no wall top
			(cursorWorldPosition-Vector3.up*2.5);
		
		if (weapon.needPositionUpdate){
			weapon.gameObject.SendMessage("OnUpdateTarget", positionalTarget);
		}
		var weaponSwitch:boolean;
		if (weaponSwitchGUI==false){
			#if UNITY_IPHONE || UNITY_ANDROID
				if (MainMenu.useSensor){
					if (SystemInfo.supportsGyroscope){
						weaponSwitch = Input.gyro.userAcceleration.z < -0.7;
					}else{
						weaponSwitch = Input.acceleration.z <-1.2;
					}
				}
			#else
				weaponSwitch = Input.GetAxis("Fire2")>=1;
			#endif
		}else{
			weaponSwitch = true;
			weaponSwitchGUI = false;
		}
		if (weaponSwitch && Time.time > lastWeaponSwitch + weapon.switchTime){
			lastWeaponSwitch = Time.time;
			RPCWeaponSwitch((curWeapon+1)%ws.length);//use networkView to control weapon sync
		}
	}
	var fromV:Vector3 = transform.forward;
	var toV:Vector3 = cursorWorldPosition - transform.position;
	fromV.y = 0;
	toV.y = 0;
	var quat: Quaternion = Quaternion.FromToRotation( fromV, toV);
	var axis:Vector3;
	quat.ToAngleAxis(angle, axis);
	
	if (MainMenu.UseCheat) weapon.ammoRemain = 1000;

	var actualShot:boolean = true;
	if (weapon.cooldown > 0){
		if (!oldIsFiring && isFiring){
			if ((!controllable) || (!weapon.hasAmmo) || weapon.ammoRemain>0)//do not buffer if no ammo left
				bufferedShot=1;//maximum buffered 1 shot
		}
		if ((bufferedShot>0 || isFiring) && angle<=3 && (Time.time - altFireTimer > weapon.cooldown) &&
				((!controllable) || (!weapon.hasAmmo) || weapon.ammoRemain>0)){
			//if (controllable && weapon.hasAmmo && (weapon.ammoRemain>0)) bufferedShot = 0;
			//RPCFireMissile();
			//transform.SendMessage ("RPCFireMissile");
			if (weapon.needPosition){
				//weapon.gameObject.SendMessage("OnLaunchBullet", cursorWorldPosition - Vector3.up*2.5);
				var projectile:ProjectileBullet = weapon.GetComponent(ProjectileBullet);
				if (!controllable){
					positionalTarget = (cursorWorldPosition-Vector3.up*2.5);
				}
				if (projectile.CheckValidTarget(positionalTarget) || (!controllable)){
					projectile.OnLaunchBullet(positionalTarget);
				}else actualShot = false;
				//isFiring = false;
			}else{
				weapon.gameObject.SendMessage("OnLaunchBullet");
			}
			bufferedShot = 0;//cancel the buffer even when the shot is not made!
			if (actualShot){
				altFireTimer = Time.time;
				visi.Reveal();
				if (controllable) weapon.ammoRemain--;
				#if UNITY_FLASH
				onetimeFireAnimation();
				#else
				NetworkU.RPC(this, "onetimeFireAnimation", NetRPCMode.All);
				#endif
			}
		}
	}else{//continuous firing
		if (isFiring && (firing || angle<=3)){
			if (weapon.needPosition){
				//weapon.gameObject.SendMessage("OnLaunchBullet", cursorWorldPosition - Vector3.up*2.5);//TODO: hard code
				var projectile2:ProjectileBullet = weapon.GetComponent(ProjectileBullet);
				if (projectile2.CheckValidTarget(positionalTarget)){
					projectile2.OnLaunchBullet(positionalTarget);
				}else actualShot = false;
			}else{
				weapon.gameObject.SendMessage("OnLaunchBullet");
			}
			if (actualShot){
				if (!firing){ 				
					#if UNITY_FLASH
					startFireAnimation();
					#else
					NetworkU.RPC(this, "startFireAnimation", NetRPCMode.All);
					#endif
				}
				firing = true;
				visi.Reveal();
			}
		}else{
			if (firing){
				#if UNITY_FLASH
				stopFireAnimation();
				#else
				NetworkU.RPC(this, "stopFireAnimation", NetRPCMode.All);
				#endif
				weapon.gameObject.SendMessage("OnStopFiring");
			}
			firing = false;
		}
	}
}

private var buttonFire:boolean = false;
function OnGUI(){
	if (!NetworkU.IsMine(this) || !controllable) return;
		
	GUISizer.BeginGUI();
	
	var btnRect : Rect = new Rect();
	btnRect.width = switchButtonStyle.normal.background.width;
	btnRect.height = switchButtonStyle.normal.background.height;
	btnRect.x = (GUISizer.width - btnRect.width) * 0.5f;
	btnRect.y = GUISizer.height - btnRect.height;
	if (GUI.Button(btnRect, "Switch",switchButtonStyle)){
		weaponSwitchGUI = true;
		//Event.current.Use();
	}
	
	#if UNITY_IPHONE || UNITY_ANDROID
	//if (MainMenu.useAutoAim && (!ws[curWeapon].playerAutoShoot)){
		btnRect.x = GUISizer.width - GUISizer.height*0.1;
		btnRect.width = 0.1*GUISizer.height;
		btnRect.y = 0.9*GUISizer.height;
		btnRect.height = 0.1*GUISizer.height;
		
		if (GUI.Button(btnRect, "shoot!")){
			manualFire = true;
			hasPos = false;
			buttonFire = true;
		}else{
			if (buttonFire){
				manualFire = false;
				buttonFire = false;
			}
		}
	//}
	#endif

	// show ammo
	var ammo : String = "Infinity";
	var rect : Rect = new Rect(GUISizer.width - 100, 0,100,100);
	if (GetCurrentWeapon().hasAmmo)
	{
		ammo = GetCurrentWeapon().ammoRemain.ToString();
	}
	GUI.Button(rect,ammo,ammoStyle);
	
	GUISizer.EndGUI();
}

#if !UNITY_FLASH
@RPC
#endif
function startFireAnimation(){
	//Debug.Log('start fire!');
	playerAnimation.OnStartFire();
}

#if !UNITY_FLASH
@RPC
#endif
function stopFireAnimation(){
	//Debug.Log('stop fire!');
	playerAnimation.OnStopFire();
}

#if !UNITY_FLASH
@RPC
#endif
function onetimeFireAnimation(){
	playerAnimation.OnStartFire();
	yield WaitForSeconds(playerAnimation.shootingTime);
	playerAnimation.OnStopFire();
}
#if !UNITY_FLASH
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
#endif

#if !UNITY_FLASH
@RPC
#endif
function RPCWeaponSwitch(newWeapon:int){
	Debug.Log("RPC Switch weapon " + newWeapon);
	ws[curWeapon].SetEnable(false);
	if (GetComponent.<Visibility>().GetVisible())
		ws[newWeapon].SetEnable(true);
	curWeapon = newWeapon;
	autoShootAllow = ws[newWeapon].playerAutoShoot;
	
	if (controllable)
		autoShoot.enabled = autoShootAllow;
	
	#if UNITY_IPHONE || UNITY_ANDROID
		if (NetworkU.IsMine(this)){
			if (ws[curWeapon].needPosition)
				gameObject.SendMessage("SetJoystickReset",true);
			else
				gameObject.SendMessage("SetJoystickReset",false);
		}
	#endif
}
#if !UNITY_FLASH
@RPC
#endif
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