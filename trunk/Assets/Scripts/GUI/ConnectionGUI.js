#pragma strict

class ConnectionGUI extends ScreenGUI{
	var remoteIP = "127.0.0.1";
	var remotePort = 25000;
	public static var listenPort = 25000;
	var teamNum = 1;
	var yourIP = "";
	var yourPort = "";
	static var na = "";
	
	var testStatus = "Testing network connection capabilities.";
	var testMessage = "Test in progress";
	var shouldEnableNatMessage : String = "";
	var doneTesting = false;
	var probingPublicIP = false;
	var serverPort = 9999;
	var connectionTestResult = ConnectionTesterStatus.Undetermined;
	var useNat : boolean;
	var timer : float;
	
	static var dedicatedServer : boolean = false;
	
	function Awake(){
		if (dedicatedServer){
			Application.targetFrameRate = 15;
			Network.InitializeServer(32, listenPort, !Network.HavePublicAddress());
			MasterServer.RegisterHost("inno_ShadowForce", "public_server", "dedicated server");
			// Notify our objects that the level and the network is ready
			for (var go : GameObject in FindObjectsOfType(GameObject))
			{
				go.SendMessage("OnNetworkLoadedLevel",
				SendMessageOptions.DontRequireReceiver);
			}
		}else{
			na = "name" + Mathf.FloorToInt(Random.value*9);
			MasterServer.RequestHostList("inno_ShadowForce");
		}
		
		Physics.IgnoreLayerCollision(0, 11, true);//default vs playertrigger
		Physics.IgnoreLayerCollision(8, 11, true);//player vs playertrigger
		Physics.IgnoreLayerCollision(19, 20, true);//projectile vs fence
	}
	
	function DrawGUI () {
		// Checking if you are connected to the server or no
		if (Network.peerType == NetworkPeerType.Disconnected)
		{
		    GUILayout.Label("Current Status: " + testStatus);
		    GUILayout.Label("Test result : " + testMessage);
		    GUILayout.Label(shouldEnableNatMessage);
		    /*if (!doneTesting)
		        TestConnection();
		    //*/
	
			GUILayout.BeginHorizontal();
			if (GUILayout.Button("Scan for games")){
				MasterServer.RequestHostList("inno_ShadowForce");
			}
			GUILayout.EndHorizontal();
			var data : HostData[] = MasterServer.PollHostList();
			// Go through all the hosts in the host list
			//Debug.Log("hostnum"+data.Length+Network.HavePublicAddress());
			for (var element in data)
			{
				GUILayout.BeginHorizontal();	
				var name = element.gameName + " " + element.connectedPlayers + " / " + element.playerLimit;
				GUILayout.Label(name);	
				GUILayout.Space(5);
				var hostInfo : String;
				hostInfo = "[";
				for (var host in element.ip)
					hostInfo = hostInfo + host + ":" + element.port + " ";
				hostInfo = hostInfo + "]";
				GUILayout.Label(hostInfo);	
				GUILayout.Space(5);
				GUILayout.Label(element.comment);
				GUILayout.Space(5);
				GUILayout.FlexibleSpace();
				if (GUILayout.Button("Join BLUE"))
				{
					// Connect to HostData struct, internally the correct method is used (GUID when using NAT).
					teamNum = 1;
					Network.Connect(element);			
				}
				if (GUILayout.Button("Join RED"))
				{
					// Connect to HostData struct, internally the correct method is used (GUID when using NAT).
					teamNum = 2;
					var err : NetworkConnectionError = Network.Connect(element);
				}
				GUILayout.EndHorizontal();
			}
	
			GUILayout.BeginHorizontal();
			if (GUILayout.Button ("Create game"))
			{
				//Network.useNat = useNAT;
				// Creating server
				teamNum = 1;
				Network.InitializeServer(32, listenPort, !Network.HavePublicAddress());
				MasterServer.RegisterHost("inno_ShadowForce", "game"+na, "open game");
				// Notify our objects that the level and the network is ready
				/*for (var go : GameObject in FindObjectsOfType(GameObject))
				{
					go.SendMessage("OnNetworkLoadedLevel", SendMessageOptions.DontRequireReceiver);
				}*/
				SendMessage("OnNetworkLoadedLevel",	SendMessageOptions.DontRequireReceiver);
				//Debug.Log(Application.persistentDataPath);
			}
	
			GUILayout.Label("Enter your name:");
			na = GUILayout.TextField(na.ToString());
			GUILayout.EndHorizontal();
		}
		else
		{
			if (Network.isServer){
				// Getting your ip address and port
				var ipaddress = Network.player.ipAddress;
				var port = Network.player.port.ToString();
				GUI.Label(new Rect(140,20,250,40),"IP Adress: "+ipaddress+":"+port);
				if (GUI.Button (new Rect(10,10,100,50),"Disconnect"))
				{
					// Disconnect from the server
					Network.Disconnect(200);
					if (Network.isServer) MasterServer.UnregisterHost();
				}
			}
			GUI.Label(new Rect(10,65,250,40),"Score: "+Team.team2D+" - "+Team.team1D);
		}
	}
	/*
	function OnConnectedToServer () {
		for (var go : GameObject in FindObjectsOfType(GameObject))
			go.SendMessage("OnNetworkLoadedLevel",
				SendMessageOptions.DontRequireReceiver);
	}*/
	
	function OnFailedToConnect(error : NetworkConnectionError){
		Debug.Log("connect: "+error);
	}
	
	function OnFailedToConnectToMasterServer(error : NetworkConnectionError){
		Debug.Log("connect: "+error);
	}
	
	function GetTeamNum(){
		return teamNum;
	}
	
	function Update () {
	}
	
	function TestConnection() {
	    // Start/Poll the connection test, report the results in a label and 
	    // react to the results accordingly
	    connectionTestResult = Network.TestConnection();
	    switch (connectionTestResult) {
	        case ConnectionTesterStatus.Error: 
	            testMessage = "Problem determining NAT capabilities";
	            doneTesting = true;
	            break;
	            
	        case ConnectionTesterStatus.Undetermined: 
	            testMessage = "Undetermined NAT capabilities";
	            doneTesting = false;
	            break;
	                        
	        case ConnectionTesterStatus.PublicIPIsConnectable:
	            testMessage = "Directly connectable public IP address.";
	            useNat = false;
	            doneTesting = true;
	            break;
	            
	        // This case is a bit special as we now need to check if we can 
	        // circumvent the blocking by using NAT punchthrough
	        case ConnectionTesterStatus.PublicIPPortBlocked:
	            testMessage = "Non-connectble public IP address (port " + 
	                serverPort +" blocked), running a server is impossible.";
	            useNat = false;
	            // If no NAT punchthrough test has been performed on this public 
	            // IP, force a test
	            if (!probingPublicIP) {
	                connectionTestResult = Network.TestConnectionNAT();
	                probingPublicIP = true;
	                testStatus = "Testing if blocked public IP can be circumvented";
	                timer = Time.time + 10;
	            }
	            // NAT punchthrough test was performed but we still get blocked
	            else if (Time.time > timer) {
	                probingPublicIP = false;         // reset
	                useNat = true;
	                doneTesting = true;
	            }
	            break;
	        case ConnectionTesterStatus.PublicIPNoServerStarted:
	            testMessage = "Public IP address but server not initialized, "+
	                "it must be started to check server accessibility. Restart "+
	                "connection test when ready.";
	            break;
	                        
	        case ConnectionTesterStatus.LimitedNATPunchthroughPortRestricted:
	            testMessage = "Limited NAT punchthrough capabilities. Cannot "+
	                "connect to all types of NAT servers. Running a server "+
	                "is ill advised as not everyone can connect.";
	            useNat = true;
	            doneTesting = true;
	            break;
	            
	        case ConnectionTesterStatus.LimitedNATPunchthroughSymmetric:
	            testMessage = "Limited NAT punchthrough capabilities. Cannot "+
	                "connect to all types of NAT servers. Running a server "+
	                "is ill advised as not everyone can connect.";
	            useNat = true;
	            doneTesting = true;
	            break;
	        
	        case ConnectionTesterStatus.NATpunchthroughAddressRestrictedCone:
	        case ConnectionTesterStatus.NATpunchthroughFullCone:
	            testMessage = "NAT punchthrough capable. Can connect to all "+
	                "servers and receive connections from all clients. Enabling "+
	                "NAT punchthrough functionality.";
	            useNat = true;
	            doneTesting = true;
	            break;
	
	        default: 
	            testMessage = "Error in test routine, got " + connectionTestResult;
	    }
	    if (doneTesting) {
	        if (useNat)
	            shouldEnableNatMessage = "When starting a server the NAT "+
	                "punchthrough feature should be enabled (useNat parameter)";
	        else
	            shouldEnableNatMessage = "NAT punchthrough not needed";
	        testStatus = "Done testing";
	    }
	}
	
	
	
	//these function should be moved to another global file!
	//private static var objectPrefab : GameObject;
	public var prefabs: GameObject[];
	
	static function CreateTeamObject(prefab:GameObject, viewID:NetworkViewID, pos:Vector3, quat: Quaternion, team:int):void
	{
	// this is bad, very bad
		var connection : ConnectionGUI = FindObjectOfType(ConnectionGUI) as ConnectionGUI;
		Debug.Log(prefab);
		var i:int = connection.GetComponent(ConnectionGUI).GetPrefabID(prefab);
		connection.GetComponent(ConnectionGUI).networkView.RPC("_CreateTeamObject", RPCMode.AllBuffered, [i, viewID, pos, quat, team]); 
	}
	
	function GetPrefabID(prefab:GameObject):int{
		var i:int;
		for (i=0; i<prefabs.length; i++){
			if (prefab == prefabs[i]) break;
		}
		return i;	
	}
	
	@RPC
	function _CreateTeamObject(prefabID:int, viewID:NetworkViewID, pos:Vector3, quat: Quaternion, team:int):void
	{
		//Debug.Log(prefabID);
		var go:GameObject = Instantiate(prefabs[prefabID], pos, quat);
		go.GetComponent.<Team>().SetTeam(team);
		go.networkView.viewID = viewID;
	}
}
