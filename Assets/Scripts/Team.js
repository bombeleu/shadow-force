#pragma strict
@script RequireComponent (NetworkView)

public static var ammo = 20;

public var team: int = 0;
public var na: String = "p";

private var viMesh: VisionMeshScript;
function Awake(){
	viMesh = gameObject.GetComponentInChildren(VisionMeshScript);
}


function OnSerializeNetworkView (stream : BitStream, info : NetworkMessageInfo) {
	stream.Serialize(team);
	if (stream.isWriting){
	}else{
		_SetTeam(team);
	}
}

@RPC
function SetTeam(t:int){
	team = t;
	_SetTeam(team);
}

function _SetTeam(t:int){
	viMesh.visionColor = t==1?Color.blue:Color.red;
	viMesh.visionColor.a = 0.2;
}


@RPC
function SetName(name: String){
	na = name;
	transform.FindChild("TeamName").GetComponent(TextMesh).text = na;
}

static var team1D:int = 0;
static var team2D:int = 0;
@RPC
function ReportDeath(team: int){
	if (team==1) team1D++;
	if (team==2) team2D++;
}
