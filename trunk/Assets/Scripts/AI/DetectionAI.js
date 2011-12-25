#pragma strict
class DetectionAI extends MonoBehaviour{
	protected var observer:Observer;
	protected var enemies:Hashtable = new Hashtable();
	protected var observerValue : boolean;
	
	function Awake(){
		observer = GetComponent(Observer);
		observerValue = observer.wantEventTrigger;	
	}
	
	function OnEnable(){
		observer.wantEventTrigger = true;
	}
	
	function OnDisable(){
		observer.wantEventTrigger = observerValue;
	}
	
	function OnDetectEnemy(enemy:Visibility){
		var key:Object = enemy.gameObject.GetInstanceID();
		if (!enemies.ContainsKey(key)){
			enemies.Add(key, enemy);
			enemy.AddObserver(this);
		}
	}
	
	function OnLoseSightEnemy(enemy:Visibility){
		var key:Object = enemy.gameObject.GetInstanceID();
		if (enemies.ContainsKey(key)){
			enemies.Remove(key);
			enemy.RemoveObserver(this);
		}
	}
	
	function RemoveEnemy(enemy:Visibility){
		var key:Object = enemy.gameObject.GetInstanceID();
		if (enemies.ContainsKey(key)){
			enemies.Remove(key);
		}
	}
}
