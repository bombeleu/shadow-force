#pragma strict
@script RequireComponent (UIController)
@script RequireComponent (ConnectionGUI)

class MainMenu extends ScreenGUI{
	private var currentLevel : int = 0;
	private var stars : int[];
	
	private var uiController : UIController;
	function Awake () {
		uiController = GetComponent(UIController);
		
		currentLevel = PlayerPrefs.GetInt("curLevel",2);
		//stars = new int[Application.levelCount];
		stars = new int[levelList.Length];
		for (var i:int = 0; i < levelList.Length; i++){
			stars[i] = PlayerPrefs.GetInt("stars"+i, 0);
		}
	}
	
	public enum MenuState{
		OuterMost,
		Single,
		Coop,
		Multi
	}
	public var state : MenuState = MenuState.OuterMost;
	
	public var levelList : String[];
	
	function DrawGUI () {
		if (state == MenuState.OuterMost){
			if (GUILayout.Button("Single play")){
				state = MenuState.Single;
			}
			if (GUILayout.Button("(doing)Co-op VS computer")){
			
			}
			if (GUILayout.Button("Online battle")){
				//state = MenuState.Multi;
				Application.LoadLevel(levelList[0]);
				uiController.SetCurrentGUI(GetComponent(ConnectionGUI));
			}
			if (GUILayout.Button("(doing)Scoreboard")){
			
			}
			if (GUILayout.Button("(doing)Weapon store")){
			
			}
		}else if (state == MenuState.Single){
			GUILayout.Label("Select an unlocked level");
			for (var i:int = 0; i <= currentLevel; i++){
				GUILayout.BeginHorizontal();
				if (GUILayout.Button("Level " + levelList[i])){
					Application.LoadLevel(levelList[i]);
				}
				GUILayout.Label("stars earned: "+stars[i]);
				GUILayout.EndHorizontal();
			}
			if (GUILayout.Button("Back")){
				state = MenuState.OuterMost;
			}
		}
	}
}

function OnLevelWasLoaded (level : int) {
	if (state == MenuState.Single){
		Network.InitializeServer(32, ConnectionGUI.listenPort, !Network.HavePublicAddress());
		SendMessage("OnNetworkLoadedLevel",	SendMessageOptions.DontRequireReceiver);
		uiController.SetCurrentGUI(null);
	}
}