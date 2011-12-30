#pragma strict
@RequireComponent(NavMeshAgent)

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
	/*#if UNITY_FLASH
	private var navigator:Object;
	#else*/
	private var navigator:NavMeshAgent;
	//#endif
	function Awake(){
		super.Awake();
		/*#if UNITY_FLASH
		navigator = GetComponent("NavMeshAgent");
		if (navigator!=null){
			NetworkU.InitNav(navigator);
		}
		#else*/
		navigator = GetComponent(NavMeshAgent);
		if (navigator){
			navigator.updatePosition = false;
			navigator.updateRotation = false;
		}
		//#endif
	}
	
	private var chasing:boolean = false;
	private var lastTarget:Vector3;
	private var shootingTarget:Visibility;
	private var saidNotChase:boolean = false;
	private var dodging:boolean = false;
	function Update () {
		//movement control
		var canPatrol:boolean = false;
		if (
			#if UNITY_FLASH
			!blocker && 
			#endif
			dodger && dodger.IsActive()){
			motor.movementDirection = dodger.GetVector().normalized;
			dodging = true;
		}else if (shootAI){
			if (dodging){//done dodging, can check here because all dodgers have shooting
				dodging = false;
				talkAI.Say(TalkType.Dodge);
			}
			if (enemies.Count>0){
				saidNotChase = false;
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
						/*#if UNITY_FLASH
						if (NetworkU.NavSetDest(navigator,tarPos)){
						#else*/
						if (navigator.SetDestination(tarPos)){
						//#endif
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
						/*#if UNITY_FLASH
						if (NetworkU.NavSetDest(navigator,tarP)){
						#else*/
						if (navigator.SetDestination(tarP)){
						//#endif
							lastTarget = tarP;
							chasing = true;
							talkAI.Say(TalkType.Chase);
						}
					}else{ 
						if (!saidNotChase){
							talkAI.Say(TalkType.NotChase);
							saidNotChase = true;
						}
					}
				}
				motor.facingDirection = Vector3.zero;
				if (!chasing) canPatrol = true;
			}
			if (chasing){
				var v:Vector3 = 
				/*#if UNITY_FLASH
				NetworkU.NavNextPos(navigator)
				#else*/
				navigator.nextPosition 
				//#endif
				- transform.position;
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
				if (chaseAI){
					if (motor.movementDirection == Vector3.zero)
						talkAI.Say(TalkType.None);
					else 
						talkAI.Say(TalkType.Patrol);
				}else talkAI.Say(TalkType.PatrolNotChase);
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
