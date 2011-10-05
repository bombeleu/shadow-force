#pragma strict

var spawnTransform : Transform;

function OnTriggerEnter (other : Collider) {
	Debug.Log("spawn enter", other);
	var checkpointKeeper : SpawnAtCheckpoint = other.GetComponent.<SpawnAtCheckpoint> () as SpawnAtCheckpoint;
	if (checkpointKeeper) 
		checkpointKeeper.checkpoint = spawnTransform;
}
