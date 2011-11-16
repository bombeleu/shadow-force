#pragma strict
@script RequireComponent (Rigidbody)

public var explosionPrefab : GameObject;
public var timeTillDie : float = 0.5;
private var _triggered : boolean = false;
private var _impactPosition : Vector3;

function Update () {
	if (_triggered)
	{
		transform.position = _impactPosition;
		timeTillDie = timeTillDie - Time.deltaTime;
		if (timeTillDie < 0)
		{
			Spawner.Destroy (gameObject);
		}
	}
}

function OnCollisionEnter(collision : Collision) {
	Spawner.Spawn (explosionPrefab, transform.position, Quaternion.identity/*transform.rotation*/);
	_impactPosition = transform.position;
	_triggered = true;
}