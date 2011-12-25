#pragma strict

public var motor : FreeMovementMotor;

private var blockV : Vector3;
private var isActive:boolean = false;
private var _isActive:boolean = false;

function Start(){
	blockV = Vector3.zero;
	
			
	var nav:NavMeshAgent = GetComponent(NavMeshAgent);
	if (nav){
		//var titan:PlayerMoveController = GameObject.FindObjectOfType(PlayerMoveController);
		nav.destination = Vector3(1,2,22);//titan.transform.position;
		//nav.speed = 0;
		//nav.Stop(false);
		nav.updatePosition = false;
		nav.updateRotation = false;
		//nav.speed = 3;
	}
}

function Update(){
	var nav:NavMeshAgent = GetComponent(NavMeshAgent);
	if (nav){
		Debug.Log("next"+nav.nextPosition);
		var v:Vector3 = nav.nextPosition - transform.position;
		v.y = 0;
		Debug.Log(nav.pathStatus + " " + nav.pathPending+" "+nav.isPathStale);
		
		//Debug.Log("path end:"+nav.pathEndPosition);
		motor.movementDirection = v.normalized;
	}
}

function OnBlockZone(blockDir:Vector3):void{
	blockV += blockDir;
	isActive = true;
}

function LateUpdate(){
	if (isActive){
		//motor.movementDirection = escapeV.normalized;
		motor.facingDirection = blockV.normalized;
		//Debug.Log('dodging!');
	}
	//if (!_isActive)
	//	motor.facingDirection = Vector3.zero;
	
	blockV = Vector3.zero;
	_isActive = isActive;
	isActive = false;
}

function IsActive():boolean{
	return _isActive;
}