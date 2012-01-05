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

private var cameraFocusPos:Vector3;
private var cameraLastFocus:Vector3;
private var cameraPlane:Plane;
private var groundPlane:Plane;
private var cameraFocusStartTime:float = -1;

// gui
public var playButtonStyle : GUIStyle;
public var playButtonRect : Rect;

// end gui

private var init:boolean = false;
private var ready:boolean = false;
function OnGUI(){
	if (!loaded) return;
	if (!init){//func Start code here
		init = true;
		cameraFocusPos = Camera.main.transform.position;
		cameraLastFocus = cameraFocusPos;
		cameraPlane = new Plane(Vector3.up, cameraFocusPos);
		groundPlane = new Plane(Vector3.up, Vector3.zero);
	}
	
	GUISizer.BeginGUI();
//	var rect:Rect;
//	rect.x = Screen.width *0.8;
//	rect.width = Screen.width * 0.2;
//	rect.y = 0;
//	rect.height = Screen.height * 0.2;
	if (GUI.Button(playButtonRect,"",playButtonStyle)){
		loaded = false;
		ready = true;
		
		camStartPos = Camera.main.transform.position;
		camStartRot = Camera.main.transform.rotation;
		startTime = Time.time;

		GetComponent(LineOfSight).revealAll = false;

						
		var spawners = GameObject.FindGameObjectsWithTag ("Respawn");
		
		spawn = spawners[ Mathf.Floor( (spawners.length-1) * Random.value)].transform;

		character = NetworkU.Instantiate(playerPrefab, spawn.position + Vector3(0,4,0), spawn.rotation);
		character.GetComponent(PlayerMoveController).enabled = false;

		cameraOffset = character.GetComponent(PlayerMoveController).cameraOffset;
		endRotation = Quaternion.LookRotation(-cameraOffset,Vector3.up);
	
		character.GetComponent(WeaponManager).SetWeaponSelection();
		
		#if UNITY_FLASH
		var te:int = 1;
		var na:String = "hero";
		character.GetComponent(Team).SetTeam(te);		
		character.GetComponent(Team).SetName(na);
		#else
		var te:int = conGUI.GetTeamNum();
		var na:String = ConnectionGUI.na;
		NetworkU.RPC(character.GetComponent(Team), "SetTeam", NetRPCMode.AllBuffered, te);		
		NetworkU.RPC(character.GetComponent(Team), "SetName", NetRPCMode.AllBuffered, na);
		#endif
		
		LineOfSight.myTeam = te;
		//setCamera(character);	
	}
	var cam:Camera = Camera.main;
	if (Event.current.type == EventType.MouseDown){
		var hitInfo:RaycastHit;
	 	//Physics.Raycast(cam.ScreenPointToRay(Input.mousePosition), hitInfo);
	 	var camRay:Ray = cam.ScreenPointToRay(Input.mousePosition);
	 	var camDist:float;
	 	groundPlane.Raycast(camRay, camDist);
	 	var hitPoint:Vector3 = camRay.GetPoint(camDist);
 		var invertRay:Ray = new Ray(hitPoint, -cam.transform.forward);

  		var dist:float;
 		cameraPlane.Raycast(invertRay, dist); 
 		cameraFocusPos = invertRay.GetPoint(dist);
 		cameraFocusStartTime = Time.time;
 		cameraLastFocus = cam.transform.position;
 		//Debug.Log("cam "+cameraFocusPos+" "+cameraLastFocus+" "+dist);
	}
	var t:float = Time.time - cameraFocusStartTime;//1 second
	cam.transform.position = Vector3.Slerp(cameraLastFocus, cameraFocusPos, t);
	
	GUISizer.EndGUI();
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
	
}

