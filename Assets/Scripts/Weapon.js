#pragma strict
//@script RequireComponent (NetworkView)

//component for 'weapon' prefab

public var needPosition:boolean = false;
public var cooldown:float = 0.5;
public var bulletPrefab: GameObject;
public var spawnPoint : Transform;
public var switchTime : float = 1;

/*class Weapon extends ScriptableObject{
	public var needPosition:boolean = false;
	public var cooldown:float = 0.5;
	public var bulletPrefab: GameObject;
	public function saySth(){
		Debug.Log("abcdef");
	}
}
*/

function SetEnable(b:boolean){
	var rr = gameObject.GetComponentsInChildren(Renderer);
	for (var r:Component in rr){
		r.renderer.enabled = b;
	}
}