#pragma strict
@script RequireComponent (Observer)

public var weaponManager:WeaponManager;
public var motor : MovementMotor;

private var observer:Observer;
private var enemies:Hashtable = new Hashtable();
private var observerValue : boolean;

function Awake(){
	observer = GetComponent(Observer);
	observerValue = observer.wantEventTrigger;
}

function OnEnable(){
	observer.wantEventTrigger = true;
}

function OnDisable(){
	observer.wantEventTrigger = observerValue;
}

function OnDetectEnemy(enemy:Visibility){
	var key:Object = enemy.gameObject.GetInstanceID();
	if (!enemies.ContainsKey(key)){
		enemies.Add(key, enemy);
		enemy.AddObserver(this);
	}
}

function OnLoseSightEnemy(enemy:Visibility){
	var key:Object = enemy.gameObject.GetInstanceID();
	if (enemies.ContainsKey(key)){
		enemies.Remove(key);
		enemy.RemoveObserver(this);
	}
}

function RemoveEnemy(enemy:Visibility){
	var key:Object = enemy.gameObject.GetInstanceID();
	if (enemies.ContainsKey(key)){
		enemies.Remove(key);
	}
}

private var firing:boolean = false;
function Update(){
	if (enemies.Count==0){
		if (firing){
			weaponManager.WeaponStopFire();
			firing = false;
		}
	}else{
		firing = true;
		var tarPos:Vector3;
		tarPos.y = transform.position.y;
		for (var i:Object in enemies.Values){
			tarPos = (i as Visibility).transform.position;
			break;
		}
		var targetV:Vector3 = tarPos - transform.position;
		//motor.movementDirection = Vector3.zero;//targetV;
		var weapon:Weapon = weaponManager.GetCurrentWeapon();
		var shoot:boolean = false;
		if (weapon.hasRange){
			if (targetV.magnitude <= weapon.range)
				shoot = true;
		}else shoot = true;
		if (shoot){
			motor.facingDirection = targetV.normalized;
			weaponManager.WeaponStartFire(tarPos);
		}
	}
}