#pragma strict
//@script RequireComponent (NetworkView)

//component for 'weapon' prefab

public var needPosition:boolean = false;
public var needPositionUpdate:boolean = false;
public var cooldown:float = 0.5;
public var bulletPrefab: GameObject;
public var spawnPoint : Transform;
public var switchTime : float = 1;
public var playerAutoShoot: boolean = false;
public var hasRange: boolean = false;
public var range: float = 0;

@HideInInspector
public var owner: Transform;
/*class Weapon extends ScriptableObject{
	public var needPosition:boolean = false;
	public var cooldown:float = 0.5;
	public var bulletPrefab: GameObject;
	public function saySth(){
		Debug.Log("abcdef");
	}
}
*/

private var visiBucket:VisibleBucket;
function Awake(){
	visiBucket = GetComponent.<VisibleBucket>();
}
public var isEnable:boolean=true;

function SetEnable(b:boolean){
	isEnable = b;
	if (visiBucket)
		visiBucket.OnSetVisible(b);
	else{
		var rr = gameObject.GetComponentsInChildren(Renderer);
		for (var r:Component in rr){
			r.renderer.enabled = b;
		}
	}
}

public function SetDead(){
	setDeadRecursive(transform);
}

private function setDeadRecursive(t:Transform){
	if (t.GetComponent(TrajectoryRenderer)) Destroy(t.GetComponent(TrajectoryRenderer));//TODO: rewrite
	var coms:Component[] = t.GetComponents(Component);
	for (var com:Component in coms){
		if (((com as Renderer) !=null)&&((com as Transform) !=null)) Destroy(com);
	}
	for (var child:Transform in t){
		setDeadRecursive(child);
	}
}