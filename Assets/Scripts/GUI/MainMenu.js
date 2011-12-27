#pragma strict
@script RequireComponent (UIController)
@script RequireComponent (ConnectionGUI)
@script RequireComponent (SelectWeaponGUI)

class MainMenu extends ScreenGUI{
	private var currentLevel : int = 0;
	private var stars : int[];
	
	private var uiController : UIController;
	function Awake () {
		instance = this;
		uiController = GetComponent(UIController);
		
		currentLevel = PlayerPrefs.GetInt("curLevel",0);
		//stars = new int[Application.levelCount];
		stars = new int[levelList.Length];
		for (var i:int = 0; i < levelList.Length; i++){
			stars[i] = PlayerPrefs.GetInt("stars"+i, 0);
		}
		
		useSensor = PlayerPrefs.GetInt("sensor",0)==1;
		useAutoAim = PlayerPrefs.GetInt("autoAim",0)==1;
		
		Physics.IgnoreLayerCollision(0, 11, true);//default vs playertrigger
		Physics.IgnoreLayerCollision(8, 22, true);//player vs smoke
		Physics.IgnoreLayerCollision(19, 20, true);//projectile vs fence
		Physics.IgnoreLayerCollision(19, 22, true);//projectile vs smoke
		Physics.IgnoreLayerCollision(19, 19, true);//projectile vs projectile
		Physics.IgnoreLayerCollision(23, 22, true);//shield vs smoke
		//Physics.IgnoreLayerCollision(8, 23, true);//player vs shield
		Physics.IgnoreLayerCollision(8, 24, true);//player vs ragdoll --> prevent climbing!
		Physics.IgnoreLayerCollision(23, 24, true);//shield vs ragdoll --> prevent climbing!
		Physics.IgnoreLayerCollision(19, 24, true);//projectile vs ragdoll
		Physics.IgnoreLayerCollision(22, 24, true);//smoke vs ragdoll
	}
	
	function ResetData(){
		currentLevel = 0;
		for (var i:int = 0; i < stars.Length; i++){
			stars[i] = 0;
		}
		SaveConfig();
	}
	
	function UnlockAll(){
		currentLevel = levelList.Length - 1;
		SaveConfig();
	}
	
	function SaveConfig(){
		PlayerPrefs.SetInt("curLevel", currentLevel);
		for (var i:int = 0; i < levelList.Length; i++){
			PlayerPrefs.SetInt("stars"+i, stars[i]);
		}
		PlayerPrefs.SetInt("sensor", useSensor?1:0);
		PlayerPrefs.SetInt("autoAim", useAutoAim?1:0);
		PlayerPrefs.Save();
	}
	
	public enum MenuState{
		OuterMost,
		Single,
		SinglePlaying,
		Coop,
		Multi
	}
	public var state : MenuState = MenuState.OuterMost;
	
	public var levelList : String[];
	public var curLevel : int = 0;
	
	public static var useSensor:boolean;
	public static var useAutoAim:boolean;
	
	function DrawGUI () {
		
		if (state == MenuState.OuterMost){
			GUILayout.BeginHorizontal();
			if (GUILayout.Button("Single play")){
				NetworkU.UseNet = false;
				state = MenuState.Single;
			}
			if (GUILayout.Button("(debug)Reset data")){
				ResetData();
			}
			if (GUILayout.Button("(debug)Unlock all")){
				UnlockAll();
			}
			GUILayout.EndHorizontal();
			
			if (GUILayout.Button("(doing)Co-op VS computer")){
			}
			#if !UNITY_FLASH
				if (GUILayout.Button("Online battle")){
					NetworkU.UseNet = true;
					//state = MenuState.Multi;
					Application.LoadLevel(levelList[0]);
					uiController.SetCurrentGUI(GetComponent(SelectWeaponGUI));
				}
			#endif
			if (GUILayout.Button("(doing)Scoreboard")){
			}
			if (GUILayout.Button("(doing)Weapon store")){
			}
			if (GUILayout.Button("sensor: "+(useSensor?"On":"Off"))){
				useSensor = !useSensor;
				SaveConfig();
			}
			if (GUILayout.Button("Auto Aim: "+(useAutoAim?"On":"Off"))){
				useAutoAim = !useAutoAim;
				SaveConfig();
			}
		}else if (state == MenuState.Single){
			GUILayout.Label("Select an unlocked level");
			for (var i:int = 0; i <= currentLevel; i++){
				GUILayout.BeginHorizontal();
				if (GUILayout.Button("Level " + levelList[i])){
					state = MenuState.SinglePlaying;
					curLevel = i;
					Application.LoadLevel(levelList[curLevel]);
				}
				GUILayout.Label("stars earned: "+stars[i]);
				GUILayout.EndHorizontal();
			}
			if (GUILayout.Button("Back")){
				state = MenuState.OuterMost;
			}
		}else if (state == MenuState.SinglePlaying){
			if (GUILayout.Button("Exit")){
				state = MenuState.OuterMost;
				Application.LoadLevel("MainMenu");
				DestroyObject(gameObject);
			}
		}
	}
	
	function OnLevelWasLoaded (level : int) {
		if (state == MenuState.SinglePlaying){
			curStar = 0;
			//SendMessage("OnNetworkLoadedLevel",	SendMessageOptions.DontRequireReceiver);
			
			state = MenuState.SinglePlaying;
			//uiController.SetCurrentGUI(null);
			//yield WaitForSeconds(0.5);
		}
	}
	
	function NextLevel(){
		stars[curLevel] = curStar;
		curLevel ++;
		if (currentLevel < curLevel) currentLevel = curLevel;
		SaveConfig();
		Application.LoadLevel(levelList[curLevel]);
	}
	
	private var curStar : int = 0;
	function GainStar(){
		curStar++;
	}
	
	
	//these function should be moved to another global file!
	public var prefabs: GameObject[];
	private static var instance: MainMenu;
	
	static function CreateTeamObject(prefab:GameObject, 
		#if UNITY_FLASH
		viewID:int, 
		#else
		viewID:NetworkViewID, 
		#endif
		pos:Vector3, quat: Quaternion, team:int):void
	{
		var i:int = instance.GetPrefabID(prefab);
		NetworkU.RPC(instance, "_CreateTeamObject", NetRPCMode.AllBuffered, [i, viewID, pos, quat, team]); 
	}
	
	function GetPrefabID(prefab:GameObject):int{
		var i:int;
		for (i=0; i<prefabs.length; i++){
			if (prefab == prefabs[i]) break;
		}
		return i;	
	}
	
	#if !UNITY_FLASH
	@RPC
	#endif
	function _CreateTeamObject(prefabID:int, 
		#if UNITY_FLASH
		viewID:int, 
		#else
		viewID:NetworkViewID, 
		#endif
		pos:Vector3, quat: Quaternion, team:int):void
	{
		//Debug.Log(prefabID);
		var go:GameObject = Instantiate(prefabs[prefabID], pos, quat);
		go.GetComponent.<Team>().SetTeam(team);
		#if !UNITY_FLASH
			go.networkView.viewID = viewID;
		#endif
	}
}