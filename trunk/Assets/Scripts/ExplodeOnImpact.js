#pragma strict
@script RequireComponent (Rigidbody)

public var explosionPrefab : GameObject;

function Update () {
}

function OnCollisionEnter(collision : Collision) {
	Spawner.Destroy (gameObject);
	Spawner.Spawn (explosionPrefab, transform.position, Quaternion.identity/*transform.rotation*/);
}