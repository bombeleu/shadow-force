#pragma strict

// Public member data

public var patrolRoute : PatrolRoute;
public var patrolPointRadius : float = 0.5;

// Private memeber data
private var nextPatrolPoint : int = 0;
private var patrolDirection : int = 1;

private var startPos:Vector3;
private var startDir:Vector3;

function Start () {
	//patrolRoute.Register (transform.parent.gameObject);
	startPos = transform.position;
	startDir = transform.forward;
	if (patrolRoute)
		nextPatrolPoint = patrolRoute.GetClosestPatrolPoint (transform.position);
}

function OnEnable () {
	//nextPatrolPoint = patrolRoute.GetClosestPatrolPoint (transform.position);
}

function OnDestroy () {
	//patrolRoute.UnRegister (transform.parent.gameObject);
}

function Update(){
	Compute();
}

function LateUpdate(){
	computed = false;
}

function NoPatrolRoute(){
	return (patrolRoute == null || patrolRoute.patrolPoints.Count == 0);
}

private var targetVector:Vector3;
private var computed:boolean = false;
function Compute () {//this func is to ensure update order independence
	if (computed) return;//so that it won't perform 2 times per frame
	computed = true;
	// Early out if there are no patrol points
	if (NoPatrolRoute()){
		//motor.movementDirection = Vector3.zero;
		targetVector = Vector3.zero;
		return;
	}
	
	// Find the vector towards the next patrol point.
	targetVector = patrolRoute.patrolPoints[nextPatrolPoint].position - transform.position;
	targetVector.y = 0;
	
	// If the patrol point has been reached, select the next one.
	if (targetVector.sqrMagnitude < patrolPointRadius * patrolPointRadius) {
		InPatrolRoute = true;//set the flag to disable path finding!
		nextPatrolPoint += patrolDirection;
		if (nextPatrolPoint < 0) {
			nextPatrolPoint = 1;
			patrolDirection = 1;
		}
		if (nextPatrolPoint >= patrolRoute.patrolPoints.Count) {
			if (patrolRoute.pingPong) {
				patrolDirection = -1;
				nextPatrolPoint = patrolRoute.patrolPoints.Count - 2;
			}
			else {
				nextPatrolPoint = 0;
			}
		}
	}
	
	// Make sure the target vector doesn't exceed a length if one
	if (targetVector.sqrMagnitude > 1)
		targetVector.Normalize ();
	
	// Set the movement direction.
	//motor.movementDirection = targetVector;
	// Set the facing direction.//no need, if it is zero it will face the moving direction
	//motor.facingDirection = targetVector;
	//Debug.Log('patrolling!');
}

function GetVector():Vector3{
	if (!computed) Compute();
	return targetVector;
}

function GetStartDir():Vector3{
	return startDir;
}

function GetNextPatrolPoint():Vector3{
	if (!computed) Compute();
	return NoPatrolRoute()?startPos:(patrolRoute.patrolPoints[nextPatrolPoint].position);
}

public var InPatrolRoute:boolean = false;