#pragma strict
#if !UNITY_FLASH
@script RequireComponent (NetworkView)
#endif
public static var ammo = 20;

public var team: int = 0;
public var na: String = "p";

private var viMesh: VisionMeshScript;
function Awake(){
	viMesh = gameObject.GetComponentInChildren(VisionMeshScript);
	SetTeam(team);
}

#if !UNITY_FLASH
function OnSerializeNetworkView (stream : BitStream, info : NetworkMessageInfo) {
	stream.Serialize(team);
	if (stream.isWriting){
	}else{
		_SetTeam(team);
	}
}
#endif

#if !UNITY_FLASH
@RPC
#endif

function SetTeam(t:int){
	team = t;
	_SetTeam(team);
}

function _SetTeam(t:int){
	if (viMesh){
		viMesh.visionColor = t==1?Color.blue:Color.red;
		viMesh.visionColor.a = 0.2;
	}
}


#if !UNITY_FLASH
@RPC
#endif

function SetName(name: String){
	na = name;
	transform.FindChild("TeamName").GetComponent(TextMesh).text = na;
}

static var team1D:int = 0;
static var team2D:int = 0;
#if !UNITY_FLASH
@RPC
#endif

function ReportDeath(team: int){
	if (team==1) team1D++;
	if (team==2) team2D++;
}
