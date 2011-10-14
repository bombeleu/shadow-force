#pragma strict
public var character : Transform;
public var cursorPlaneHeight : float = 0;
public var spawnPoint : Transform;

//public var weapons: MonoScript[];
public var weapons: Weapon[];
private var curWeapon: int = 0;

//private var ws: Weapon[];


private var playerMovementPlane : Plane;


function Awake(){
	/*ws = new Weapon[1];
	//ws[0] =( ScriptableObject.CreateInstance(weapons[0].GetClass()) as Weapon);
	//ws[0].saySth();
	var go:GameObject = Instantiate(weapons[0], Vector3.zero, Quaternion.identity);
	ws[0] = go.GetComponent.<Weapon>();*/
	
	
	playerMovementPlane = new Plane (character.up, character.position + character.up * cursorPlaneHeight);
	altFireTimer = Time.time;
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
function Update () {
	//return;
	//this is only needed if the terrain is uneven!
	playerMovementPlane.normal = character.up;
	playerMovementPlane.distance = -character.position.y + cursorPlaneHeight;

#if UNITY_IPHONE || UNITY_ANDROID
	if (weapons[curWeapon].needPosition){
		//wait for the character rotation first
		//trigger the attack
		//distance, direction take from tap position (tap up)
	}else{
		//wait for the character rotation
		//direction takes from tap delta (virtual joystick)
	}
#else
	// On PC, the cursor point is the mouse position
	var cursorScreenPosition : Vector3 = Input.mousePosition;
	
	// Find out where the mouse ray intersects with the movement plane of the player
	var cursorWorldPosition : Vector3 = ScreenPointToWorldPointOnPlane (cursorScreenPosition, playerMovementPlane, Camera.main);

	if (weapons[curWeapon].needPosition){
		//distance, direction take from mouse position
		//wait for the character rotation first
		//trigger the attack
	}else{
		//direction takes from mouse position
		//wait for the character rotation to trigger the attack on Fire1 or Fire2 axis possitive
		var quat: Quaternion = Quaternion.FromToRotation( character.transform.rotation * Vector3.forward, 
			cursorWorldPosition - character.transform.position);
		var angle:float;
		var axis:Vector3;
		quat.ToAngleAxis(angle, axis);
		//Debug.Log(angle);
		var fireAlt:float = Input.GetAxis("Fire2");
		if (fireAlt	>=1){
			bufferedShot=1;//maximum buffered 1 shot
		}
		if (bufferedShot>0 && angle<=3 && (Time.time - altFireTimer > 0.5)){
			bufferedShot = 0;
			//RPCFireMissile();
			transform.SendMessage ("RPCFireMissile");
			altFireTimer = Time.time;
		}
		//receiver.SendMessage ("OnStartFire");
	}
#endif
}

function RPCFireMissile(){
	if (!networkView.isMine) return;
	if (Team.ammo<=0) return;
	networkView.RPC("FireMissile", RPCMode.All, [spawnPoint.position, spawnPoint.rotation]);
	//var go : GameObject = Network.Instantiate(missilePrefab, spawnPoint.position, spawnPoint.rotation, 0) as GameObject;
	Team.ammo--;
}

public var missilePrefab:GameObject;

//*
@RPC
function FireMissile(pos : Vector3, quat : Quaternion){
	var go : GameObject = Instantiate (missilePrefab, pos, quat);
}//*/