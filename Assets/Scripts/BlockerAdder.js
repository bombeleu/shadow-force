#pragma strict
@script RequireComponent (Collider)

//private var blockerManager: BlockerManager;
function Awake(){
	//blockerManager = GameObject.FindObjectOfType(BlockerManager);
	BlockerManager.Instance.AddBlocker(gameObject);
	//collider.enabled = false;
}

function OnDestroy(){
	BlockerManager.Instance.RemoveBlocker(gameObject);
}
