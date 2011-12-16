#pragma strict
@script RequireComponent (Collider)

//private var blockerManager: BlockerManager;
function Start(){
	//blockerManager = GameObject.FindObjectOfType(BlockerManager);
	BlockerManager.Instance.AddBlocker(gameObject);
	//collider.enabled = false;
}

function OnDestroy(){
	BlockerManager.Instance.RemoveBlocker(gameObject);
}
