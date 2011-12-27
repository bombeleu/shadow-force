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
	
	private function GetID(enemy:Visibility):Object{
		#if UNITY_FLASH
			return observer.gameObject.ToString();
		#else
			return observer.gameObject.GetInstanceID();
		#endif
	}
	
	function OnDetectEnemy(enemy:Visibility){
		var key:Object = GetID(enemy);
		if (!enemies.ContainsKey(key)){
			enemies.Add(key, enemy);
			enemy.AddObserver(this);
		}
	}
	
	function OnLoseSightEnemy(enemy:Visibility){
		var key:Object = GetID(enemy);
		if (enemies.ContainsKey(key)){
			enemies.Remove(key);
			enemy.RemoveObserver(this);
		}
	}
	
	function RemoveEnemy(enemy:Visibility){
		#if UNITY_FLASH
		var key:Object = enemy.gameObject.ToString();
		#else
		var key:Object = enemy.gameObject.GetInstanceID();
		#endif
		if (enemies.ContainsKey(key)){
			enemies.Remove(key);
		}
	}
}
