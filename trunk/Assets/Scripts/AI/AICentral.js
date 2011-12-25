#pragma strict
//@RequireComponent(NavMeshAgent)
class AICentral extends DetectionAI{
	public var motor : MovementMotor;
	
	public var dodger:DodgingAI;
	public var patroller:PatrolMoveController;
	
	public var chaseAI:boolean = false;
	public var shootAI:boolean = false;
	private var lastKnownPos:Vector3;
	
	//private var patrolling:boolean = true;
	public var navigator:NavMeshAgent;
	
	function Awake(){
		super.Awake();
		if (navigator){
			navigator.updatePosition = false;
			navigator.updateRotation = false;
		}
	}
	
	private var chasing:boolean = false;
	private var lastTarget:Vector3;
	function Update () {
		//movement control
		var canPatrol:boolean = false;
		if (dodger && dodger.IsActive()){
			motor.movementDirection = dodger.GetVector().normalized;
		}else if (shootAI){
			if (enemies.Count>0){
				var tarPos:Vector3;
				for (var i:Object in enemies.Values){
					tarPos = (i as Visibility).transform.position;
					break;
				}
				tarPos.y = transform.position.y;
				var dir:Vector3 = tarPos - transform.position;
				motor.facingDirection = dir.normalized;
				if (IsShootable(tarPos)){
					chasing = false;
					Shoot(tarPos);
					motor.movementDirection = Vector3.zero;
				}else{
					if ((chaseAI) && navigator.SetDestination(tarPos)){
						//Debug.Log("find path");
						lastTarget = tarPos;
						chasing = true;
					}
				}
			}else{
				StopShoot();
				if (!chasing) canPatrol = true;
			}
			if (chasing){
				var v:Vector3 = navigator.nextPosition - transform.position;
				v.y = 0;
				if ((lastTarget - transform.position).sqrMagnitude < 0.25){
					chasing = false;
					motor.movementDirection = Vector3.zero;
				}else{
					//Debug.Log("chase!"+v+navigator.isPathStale+navigator.hasPath+navigator.pathStatus+navigator.remainingDistance);
					//Debug.Log("chase"+v);
					motor.movementDirection = v.normalized;
				}
			}
		}else canPatrol = true;
		if (canPatrol){
			if (patroller){
				motor.movementDirection = patroller.GetVector().normalized;
			}else{
				motor.movementDirection = Vector3.zero;
			}
		}
		//direction control
	}
	
	public var weaponManager:WeaponManager;
	
	private var firing:boolean = false;
	
	private function IsShootable(tarPos:Vector3):boolean{
		tarPos.y = transform.position.y;
		var targetV:Vector3 = tarPos - transform.position;
		var weapon:Weapon = weaponManager.GetCurrentWeapon();
		var shoot:boolean = false;
		if (weapon.hasRange){
			if (targetV.magnitude <= weapon.range)
				shoot = true;
		}else shoot = true;
		return shoot;
	}
	
	private function Shoot(tarPos:Vector3){
		firing = true;
		tarPos.y = transform.position.y;
		var targetV:Vector3 = tarPos - transform.position;
	
		motor.facingDirection = targetV.normalized;
		weaponManager.WeaponStartFire(tarPos);
	}
	
	private function StopShoot(){
		if (firing){
			weaponManager.WeaponStopFire();
			firing = false;
		}
	}
}
