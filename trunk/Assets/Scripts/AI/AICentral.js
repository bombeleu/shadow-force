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
	
	//private var forceChase:boolean = false;
	
	public function ForceChase(target:Vector3):void{
		if ((!chasing || Time.time-lastTimeChase>chaseInterval) && navigator.SetDestination(target)){
			//forceChase = true;
			lastTimeChase = Time.time;
			lastTarget = target;
			chasing = true;
			talkAI.Say(TalkType.Chase);
		}
	}
	
	public function SayNoChase():void{
		talkAI.Say(TalkType.NotChase);
	}
	
	private var backtrackPathCompute:boolean = false;
	private var lastTimeChase:float = -1;
	static private var chaseInterval:float = 0.2;
	function Update () {
		//movement control
		var canPatrol:boolean = false;
		var fromChase:boolean = false;
		var patrolFace:boolean = true;
		motor.facingDirection = Vector3.zero;
		if (dodger && dodger.IsActive() &&
				((!blocker) || (dodger.IsIgnoreShield()) )
			){
			motor.movementDirection = dodger.GetVector().normalized;
			patroller.InPatrolRoute = false;
			dodging = true;
		}else if (shootAI){
			if (dodging){//done dodging, can check here because all dodgers have shooting
				dodging = false;
				talkAI.Say(TalkType.Dodge);
			}
			var found:boolean = false;
			var tarPos:Vector3;
			for (target in enemies.Values){
				var tarVisi:Visibility = target as Visibility;
				if (tarVisi.GetComponent(Health)==null) continue;//not sth we can shoot!
				tarPos = tarVisi.transform.position;
				found = true;
				break;
			}
			
			if (found){//got sth to shoot/chase
				saidNotChase = false;
				var target:Object;
				tarPos.y = transform.position.y;
				var dir:Vector3 = tarPos - transform.position;
				motor.facingDirection = dir.normalized;
				patrolFace = false;
				shootingTarget = target as Visibility;
				if (IsShootable(tarPos)){
					chasing = false;
					Shoot(tarPos);
					motor.movementDirection = Vector3.zero;
					talkAI.Say(TalkType.Shoot);
				}else{
					if (chaseAI){
						ForceChase(tarPos);
					}else{
						SayNoChase();
						canPatrol = true;
					}
				}
			}else{
				StopShoot();
				if (shootingTarget!=null){
					if (chaseAI){
						var tarP:Vector3 = shootingTarget.transform.position;
						tarP.y = transform.position.y;
						shootingTarget=null;//lose sight
						/*#if UNITY_FLASH
						if (NetworkU.NavSetDest(navigator,tarP)){
						#else*/
						ForceChase(tarP);
					}else{ 
						if (!saidNotChase){
							SayNoChase();
							saidNotChase = true;
						}
					}
				}
				//motor.facingDirection = Vector3.zero;
				if (!chasing){
					canPatrol = true;
				}
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
				if ((lastTarget - transform.position).sqrMagnitude < patroller.patrolPointRadius * patroller.patrolPointRadius){
					chasing = false;
					fromChase = true;
					canPatrol = true;
					//motor.movementDirection = Vector3.zero;
				}else{
					//Debug.Log("chase!"+v+navigator.isPathStale+navigator.hasPath+navigator.pathStatus+navigator.remainingDistance);
					//Debug.Log("chase"+v);
					motor.movementDirection = v.normalized;
					motor.facingDirection = v.normalized;//so that it won't rotate when dodging
					patroller.InPatrolRoute = false;
				}
			}
		}else canPatrol = true;
		if (canPatrol){
			if (patroller){
				if (patroller.InPatrolRoute){
					backtrackPathCompute = false;
					motor.movementDirection = patroller.GetVector().normalized;
					if (patrolFace){
						if (motor.movementDirection == Vector3.zero)
							motor.facingDirection = patroller.GetStartDir();
					}
					if (chaseAI){
						if (motor.movementDirection == Vector3.zero)
							talkAI.Say(TalkType.None);
						else 
							talkAI.Say(TalkType.Patrol);
					}else talkAI.Say(TalkType.PatrolNotChase);
				}else{//move back to position
					if (!backtrackPathCompute){
						if (navigator.SetDestination(patroller.GetNextPatrolPoint())){
							backtrackPathCompute = true;
							if (fromChase) talkAI.Say(TalkType.PatrolBack);
						}
					}
					if (backtrackPathCompute){
						var ve:Vector3 = navigator.nextPosition - transform.position;
						ve.y = 0;
						motor.movementDirection = ve.normalized;
						ve = transform.position - patroller.GetNextPatrolPoint();
						ve.y=0;
						if (ve.sqrMagnitude < patroller.patrolPointRadius * patroller.patrolPointRadius){
							patroller.InPatrolRoute = true;
							//backtrackPathCompute = false;
						}
					}
				}
			}else{
				motor.movementDirection = Vector3.zero;
				talkAI.Say(TalkType.None);
			}
		}
		//direction control
		if (blocker){
			if (blocker.IsActive()){
				motor.facingDirection = blocker.GetVector().normalized;
				talkAI.Say(TalkType.Block);
			}
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
		var oriPos:Vector3 = transform.position + transform.forward*0.7;
		var targetV:Vector3 = tarPos - oriPos;
		var weapon:Weapon = weaponManager.GetCurrentWeapon();
		var shoot:boolean = false;
		if (weapon.hasRange){
			if (targetV.magnitude <= weapon.range)
				shoot = true;
		}else shoot = true;
		if (shoot && (!weapon.needPosition)){//check for glass
			if (Physics.Raycast(oriPos, targetV, targetV.magnitude, glassLayers))
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
