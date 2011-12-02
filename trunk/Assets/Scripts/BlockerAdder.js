#pragma strict
@script RequireComponent (Collider)

//private var blockerManager: BlockerManager;
function Awake(){
	//blockerManager = GameObject.FindObjectOfType(BlockerManager);
	BlockerManager.AddBlocker(gameObject);
	//collider.enabled = false;
}

function OnDestroy(){
	BlockerManager.RemoveBlocker(gameObject);
}