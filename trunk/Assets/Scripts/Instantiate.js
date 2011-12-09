public var playerPrefab : Transform;
public var conGUI:ConnectionGUI;

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

function OnNetworkLoadedLevel () {
	if (ConnectionGUI.dedicatedServer && Network.isServer) return;
	var spawn: Transform;
	var spawners = GameObject.FindGameObjectsWithTag ("Respawn");
	Debug.Log("Instantiate here"+spawners.length);
	spawn = spawners[ Mathf.Floor( (spawners.length-1) * Random.value)].transform;
		
	var character : Transform = Network.Instantiate(playerPrefab, spawn.position + Vector3(0,4,0), spawn.rotation, 0);

	character.GetComponent.<WeaponManager>().SetWeaponSelection();
	
	/*var controller : PlayerMoveController;
	controller = character.GetComponent("PlayerMoveController");
	//controller.character = character.transform;
	controller.myPlayer = Network.player.guid;*/

	var controller : Team;
	controller = character.GetComponent(Team);
	//controller.character = character.transform;
	var t:int = conGUI.GetTeamNum();
	character.networkView.RPC("SetTeam", RPCMode.AllBuffered, t);
	var na:String = ConnectionGUI.na;
	character.networkView.RPC("SetName", RPCMode.AllBuffered, na);
	
	//character.Find("TeamName").GetComponent(TextMesh).text = "Team"+t;
	
	Camera.main.GetComponent(Team).team = t;
	Team.ammo = 5;
	setCamera(character);
}

function OnPlayerDisconnected (player : NetworkPlayer) {
	Network.RemoveRPCs(player, 0);
	Network.DestroyPlayerObjects(player);
}


function setCamera(character : Transform){
	Camera.main.transform.position = character.position + Vector3(10,25,25);
	Camera.main.transform.LookAt(character);
	if (Camera.main.GetComponent("HeightDepthOfField")!=null)
		(Camera.main.GetComponent("HeightDepthOfField")as HeightDepthOfField).objectFocus = character;
}