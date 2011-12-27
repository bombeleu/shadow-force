#pragma strict
#if !UNITY_FLASH
@script RequireComponent (NetworkView)
#endif
private var enemies:Hashtable;

public var weapon:Weapon;
public var weaponHold:Transform;
public var turnSpeed:float = 60;

function Awake(){
	enemies = new Hashtable();
}

function OnDetectEnemy(enemy:Visibility){
	//weapon.gameObject.SendMessage("OnLaunchBullet");
	//check for health component
	//if (enemy.GetComponent.<Health>()==null) return;
	//shoot it!
	if (!enemies.ContainsKey(enemy.gameObject.GetInstanceID())){
		//target = enemy.gameObject;
		enemies.Add(enemy.gameObject.GetInstanceID(), enemy.gameObject);
	}
	//Debug.Log("enemy detected!");
}

function OnLoseSightEnemy(enemy:Visibility){
	var key:Object = enemy.gameObject.GetInstanceID();
	if (enemies.ContainsKey(key))
		enemies.Remove(key);
}

function Start(){
	altFireTimer = Time.time;
	if (NetworkU.IsMine(this)){
		NetworkU.RPC(this, "SetWeaponNetworkViewID", NetRPCMode.AllBuffered, NetworkU.AllocateID());
	}
}

#if UNITY_FLASH
function SetWeaponNetworkViewID(id:int){//dummy func
}
#else
@RPC
function SetWeaponNetworkViewID(id:NetworkViewID){
	weapon.networkView.viewID = id;
}
#endif

private var target:GameObject;
private var altFireTimer:float;

private var curAngle:float = 0;

function Update () {
	//return;
	//*
	if (!NetworkU.IsMine(this)) return;
	//remove dead
	while (true){
		if (enemies.Count==0) break;
		var found:boolean = false;
		var fkey:Object;
		for (var i:Object in enemies.Keys){
			if (i!=null && enemies[i]==null){
				found = true;
				fkey = i;
				break;
			}
		}
		if (found){
			enemies.Remove(fkey);
		}else
			break;//all left are alive!
	}
	
	if (enemies.Count==0){
		if (weapon.cooldown <= 0)
			weapon.gameObject.SendMessage("OnStopFiring");
		return;
	}
	if (!enemies.ContainsValue(target)){//lost current target
		for (var i:Object in enemies.Values){
			target = i as GameObject;
			break;
		}
	}//*/

	var targetDir:Vector3 = target.transform.position - weaponHold.transform.position;
	targetDir.y=0;
	var weaponDir:Vector3 = transform.forward;
	weaponDir.y = 0;
	var quat: Quaternion = Quaternion.FromToRotation(weaponDir, targetDir);
	var angle:float;
	var axis:Vector3;
	quat.ToAngleAxis(angle, axis);
	if (axis.y<0) angle = -angle;
	if (curAngle<angle){
		curAngle += turnSpeed*Time.deltaTime;
	}else{
		curAngle -= turnSpeed*Time.deltaTime;
	}
	
	weaponHold.rotation = transform.rotation * Quaternion.AngleAxis(curAngle, Vector3.up);
	//*/
						
	if (weapon.cooldown > 0){
		if (Time.time - altFireTimer > weapon.cooldown){
			altFireTimer = Time.time;
			if (weapon.needPosition){
				weapon.gameObject.SendMessage("OnLaunchBullet", target.transform.position);
			}else{
				weapon.gameObject.SendMessage("OnLaunchBullet");
			}
		}
	}else{
		if (weapon.needPosition){
			weapon.gameObject.SendMessage("OnLaunchBullet", target.transform.position);
		}else{
			weapon.gameObject.SendMessage("OnLaunchBullet");
		}		
	}
}
