#pragma strict
public var motor : MovementMotor;

public var dodger:DodgingAI;
public var patroller:PatrolMoveController;

private var patrolling:boolean = true;
function Update () {
	if (patrolling)
		patroller.enabled = !dodger.IsActive();
	else
		patroller.enabled = false;
}

function OnDetectEnemy(enemy:Visibility){
	//Debug.Log('see ya!');
	patrolling = false;
	//var targetV:Vector3 = (enemy.transform.position - transform.position).normalized;
	//motor.facingDirection = targetV;
	motor.movementDirection = Vector3.zero;//targetV;
	//GetComponent(WeaponManager).WeaponStartFire(enemy.transform.position);
}

function OnLoseSightEnemy(enemy:Visibility){
	patrolling = true;
	//GetComponent(WeaponManager).WeaponStopFire();
}
