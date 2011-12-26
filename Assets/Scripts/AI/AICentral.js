#pragma strict
//@RequireComponent(NavMeshAgent)
class AICentral extends DetectionAI{
	public var motor : MovementMotor;
	
	public var dodger:DodgingAI;
	public var patroller:PatrolMoveController;
	public var blocker:BlockingAI;
	public var talkAI:TalkAI;
	
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
	private var shootingTarget:Visibility;
	function Update () {
		//movement control
		var canPatrol:boolean = false;
		if (dodger && dodger.IsActive()){
			motor.movementDirection = dodger.GetVector().normalized;
			talkAI.Say(TalkType.Dodge);
		}else if (shootAI){
			if (enemies.Count>0){
				var tarPos:Vector3;
				var target:Object;
				for (target in enemies.Values){
					tarPos = (target as Visibility).transform.position;
					break;
				}
				tarPos.y = transform.position.y;
				var dir:Vector3 = tarPos - transform.position;
				motor.facingDirection = dir.normalized;
				if (IsShootable(tarPos)){
					chasing = false;
					shootingTarget = target as Visibility;
					Shoot(tarPos);
					motor.movementDirection = Vector3.zero;
					talkAI.Say(TalkType.Shoot);
				}else{
					if (chaseAI){
						if (navigator.SetDestination(tarPos)){
							//Debug.Log("find path");
							lastTarget = tarPos;
							chasing = true;
							talkAI.Say(TalkType.Chase);
						}
					}else{
						talkAI.Say(TalkType.NotChase);
					}
				}
			}else{
				StopShoot();
				if (shootingTarget!=null){
					if (chaseAI){
						var tarP:Vector3 = shootingTarget.transform.position;
						tarP.y = transform.position.y;
					 	if (navigator.SetDestination(tarP)){
							lastTarget = tarP;
							chasing = true;
							talkAI.Say(TalkType.Chase);
						}
					}else talkAI.Say(TalkType.NotChase);
				}
				motor.facingDirection = Vector3.zero;
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
				
				if (motor.movementDirection == Vector3.zero)
					talkAI.Say(TalkType.None);
				else 
					talkAI.Say(TalkType.Patrol);
			}else{
				motor.movementDirection = Vector3.zero;
				talkAI.Say(TalkType.None);
			}
		}
		//direction control
		if (blocker && blocker.IsActive()){
			motor.facingDirection = blocker.GetVector().normalized;
			talkAI.Say(TalkType.Block);
		}
	}
	
	function RemoveEnemy(enemy:Visibility){
		super.RemoveEnemy(enemy);
		if (enemy == shootingTarget){
			chasing = false;
			talkAI.Say(TalkType.Kill);
		}
	}
	
	public var weaponManager:WeaponManager;
	
	private var firing:boolean = false;
	
	public var glassLayers:LayerMask;
	private function IsShootable(tarPos:Vector3):boolean{
		tarPos.y = transform.position.y;
		var targetV:Vector3 = tarPos - transform.position;
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