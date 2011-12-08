#pragma strict

function OnRestart(){
	yield WaitForSeconds(2);
	if (Network.isServer)
		MasterServer.UnregisterHost();
	Network.Disconnect(200);
	Application.LoadLevel(Application.loadedLevel);
}
