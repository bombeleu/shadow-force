#pragma strict
class DetectionAI extends MonoBehaviour{
	protected var observer:Observer;
	protected var enemies:Hashtable = new Hashtable();
	protected var observerValue : boolean;
	
	#if UNITY_FLASH
	public static var uniqueKey:int = 0;
	public var myKey:int;
	#endif
	
	function Awake(){
		#if UNITY_FLASH
		myKey = uniqueKey++;
		#endif
	
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
			return enemy.myKey;
		#else
			return enemy.gameObject.GetInstanceID();
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
		var key:Object = GetID(enemy);
		if (enemies.ContainsKey(key)){
			enemies.Remove(key);
		}
	}
}
