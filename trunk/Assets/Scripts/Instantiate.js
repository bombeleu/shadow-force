#pragma strict
public var playerPrefab : Transform;
#if !UNITY_FLASH
private var conGUI:ConnectionGUI;
function Awake(){
	conGUI = GetComponent(ConnectionGUI);
}
#endif

/*
function OnLevelWasLoaded (level : int) {
	var spawn: Transform;
	var spawners = GameObject.FindGameObjectsWithTag ("Respawn");
	spawn = spawners[ Mathf.Floor( (spawners.length-1) * Random.value)].transform;
		
	var character:Transform = Instantiate(playerPrefab, spawn.position + Vector3(0,4,0), spawn.rotation);
	character.GetComponent(WeaponManager).enabled = true;
	setCamera(character);
	Camera.main.GetComponent(Team).team = conGUI.GetTeamNum();
}*/

private var loaded:boolean = false;
function OnNetworkLoadedLevel () {
	#if !UNITY_FLASH
	if (ConnectionGUI.dedicatedServer && Network.isServer) return;
	#endif
	loaded = true;
	GetComponent(LineOfSight).revealAll = true;
}

private var ready:boolean = false;
function OnGUI(){
	if (!loaded) return;
	var rect:Rect;
	rect.x = Screen.width *0.8;
	rect.width = Screen.width * 0.2;
	rect.y = 0;
	rect.height = Screen.height * 0.2;
	if (GUI.Button(rect,"Ready!")){
		loaded = false;
		ready = true;
		camStartPos = Camera.main.transform.position;
		camStartRot = Camera.main.transform.rotation;
		startTime = Time.time;

		GetComponent(LineOfSight).revealAll = false;

						
		var spawners = GameObject.FindGameObjectsWithTag ("Respawn");
		Debug.Log("Instantiate here"+spawners.length);
		spawn = spawners[ Mathf.Floor( (spawners.length-1) * Random.value)].transform;

		character = NetworkU.Instantiate(playerPrefab, spawn.position + Vector3(0,4,0), spawn.rotation);
		character.GetComponent(PlayerMoveController).enabled = false;

		cameraOffset = character.GetComponent(PlayerMoveController).cameraOffset;
		endRotation = Quaternion.LookRotation(-cameraOffset,Vector3.up);
	
		character.GetComponent(WeaponManager).SetWeaponSelection();
		
		#if UNITY_FLASH
		var te:int = 1;
		var na:String = "hero";
		#else
		var te:int = conGUI.GetTeamNum();
		var na:String = ConnectionGUI.na;
		#endif
		NetworkU.RPC(character.GetComponent(Team), "SetTeam", NetRPCMode.AllBuffered, te);		
		NetworkU.RPC(character.GetComponent(Team), "SetName", NetRPCMode.AllBuffered, na);
				
		LineOfSight.myTeam = te;
		//setCamera(character);	
	}
}

private var camStartPos:Vector3;
private var camStartRot:Quaternion;
private var spawn:Transform;
private var endRotation:Quaternion;
private var startTime:float;
private var character:Transform;
private var cameraOffset:Vector3;

public var cameraGlidingTime:float = 2.0;

function Update(){
	if (!ready) return;
	var t:float = (Time.time - startTime)/cameraGlidingTime;
	if (t<=1){
		Camera.main.transform.position = Vector3.Lerp(camStartPos, spawn.position + cameraOffset, t);
		Camera.main.transform.rotation = Quaternion.Lerp(camStartRot, endRotation, t);
	}else{			
		ready = false;
		character.GetComponent(PlayerMoveController).enabled = true;
	}	
}

#if !UNITY_FLASH
function OnPlayerDisconnected (player : NetworkPlayer) {
	loaded = false;
	ready = false;
	Network.RemoveRPCs(player, 0);
	Network.DestroyPlayerObjects(player);
}
#endif


function setCamera(character : Transform){
	Camera.main.transform.position = character.position + Vector3(10,60,25);
	Camera.main.transform.LookAt(character);
	if (Camera.main.GetComponent(HeightDepthOfField)!=null)
		Camera.main.GetComponent(HeightDepthOfField).objectFocus = character;
}

