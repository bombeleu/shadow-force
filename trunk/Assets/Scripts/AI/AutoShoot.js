#pragma strict
@script RequireComponent (Observer)

class AutoShoot extends DetectionAI{
	public var weaponManager:WeaponManager;
	public var motor : MovementMotor;
	public var glassLayers:LayerMask;
	
	private var firing:boolean = false;
	function Update(){
		var stopShoot:boolean = false;
		if (enemies.Count==0){
			stopShoot = true;
		}else{
			var tarPos:Vector3;
			for (var i:Object in enemies.Values){
				tarPos = (i as Visibility).transform.position;
				break;
			}
			tarPos.y = transform.position.y;
			//Debug.Log("target found:"+tarPos);
			var targetV:Vector3 = tarPos - transform.position;
			//motor.movementDirection = Vector3.zero;//targetV;
			var weapon:Weapon = weaponManager.GetCurrentWeapon();
			var shoot:boolean = false;
			if (weapon.hasRange){
				if (targetV.magnitude <= weapon.range)
					shoot = true;
			}else shoot = true;
			if (shoot && (!weapon.needPosition)){//check for glass
				if (Physics.Raycast(transform.position, targetV, targetV.magnitude, glassLayers))
					shoot = false;
			}
			if (shoot){
				firing = true;
				motor.facingDirection = targetV.normalized;
				weaponManager.WeaponStartFire(tarPos);
			}else stopShoot = true;
		}
		if (stopShoot && firing){
			weaponManager.WeaponStopFire();
			firing = false;
		}
	}
}

