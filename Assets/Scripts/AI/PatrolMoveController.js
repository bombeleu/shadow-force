#pragma strict

// Public member data

public var patrolRoute : PatrolRoute;
public var patrolPointRadius : float = 0.5;

// Private memeber data
private var nextPatrolPoint : int = 0;
private var patrolDirection : int = 1;

function Start () {
	//patrolRoute.Register (transform.parent.gameObject);
	if (patrolRoute)
		nextPatrolPoint = patrolRoute.GetClosestPatrolPoint (transform.position);
}

function OnEnable () {
	//nextPatrolPoint = patrolRoute.GetClosestPatrolPoint (transform.position);
}

function OnDestroy () {
	//patrolRoute.UnRegister (transform.parent.gameObject);
}

private var targetVector:Vector3;
function Update () {
	// Early out if there are no patrol points
	if (patrolRoute == null || patrolRoute.patrolPoints.Count == 0){
		//motor.movementDirection = Vector3.zero;
		targetVector = Vector3.zero;
		return;
	}
	
	// Find the vector towards the next patrol point.
	targetVector = patrolRoute.patrolPoints[nextPatrolPoint].position - transform.position;
	targetVector.y = 0;
	
	// If the patrol point has been reached, select the next one.
	if (targetVector.sqrMagnitude < patrolPointRadius * patrolPointRadius) {
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
	return targetVector;
}
