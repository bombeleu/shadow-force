public var drillEffect : GameObject;
public var normalSpeed : float;
public var drillSpeed : float;

private var dir: Vector3;
private var drilling: boolean = false;
function Awake(){
	dir = transform.forward;
	dir.y = 0;
}

function Update () {
	transform.position += Time.deltaTime * dir * (drilling?drillSpeed:normalSpeed);
}

private var driller: GameObject;
function OnTriggerEnter(collider:Collider){
	if (drilling) return;
	drilling = true;
	driller = Instantiate(drillEffect, transform.position, transform.rotation);
	driller.transform.parent = transform;
	renderer.enabled = false;
}

function OnTriggerExit(collider:Collider){
	if (!drilling) return;
	drilling = false;
	Destroy(driller);
	renderer.enabled = true;
}