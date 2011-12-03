var SpaceCraft : Transform;
public var conGUI:ConnectionGUI;

function OnNetworkLoadedLevel () {
	if (ConnectionGUI.dedicatedServer && Network.isServer) return;
	// Instantiating SpaceCraft when Network is loaded
	var spawn: Transform;
	var spawners = GameObject.FindGameObjectsWithTag ("Respawn");
	/*Debug.Log("aa"+spawners.length);
	Debug.Log(Random.value);
	Debug.Log(Random.value);
	Debug.Log(Random.value);*/
	spawn = spawners[ Mathf.Floor( (spawners.length-1) * Random.value)].transform;
		
	var character = Network.Instantiate(SpaceCraft, spawn.position + Vector3(0,4,0), spawn.rotation, 0);
	/*var controller : PlayerMoveController;
	controller = character.GetComponent("PlayerMoveController");
	//controller.character = character.transform;
	controller.myPlayer = Network.player.guid;*/

	var controller : Team;
	controller = character.GetComponent("Team");
	//controller.character = character.transform;
	var t:int = conGUI.GetTeamNum();
	character.networkView.RPC("SetTeam", RPCMode.AllBuffered, t);
	var na:String = ConnectionGUI.na;
	character.networkView.RPC("SetName", RPCMode.AllBuffered, na);
	
	//character.Find("TeamName").GetComponent(TextMesh).text = "Team"+t;
	
	(Camera.main.GetComponent("Team")as Team).team = t;
	Camera.main.transform.position = spawn.position + Vector3(10,25,25);
	Camera.main.transform.LookAt(spawn.position);
	if (Camera.main.GetComponent("HeightDepthOfField")!=null)
		(Camera.main.GetComponent("HeightDepthOfField")as HeightDepthOfField).objectFocus = character;
	Team.ammo = 5;
}

function OnPlayerDisconnected (player : NetworkPlayer) {
	Network.RemoveRPCs(player, 0);
	Network.DestroyPlayerObjects(player);
}

function Update () {
}