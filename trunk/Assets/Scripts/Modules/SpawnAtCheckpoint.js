#pragma strict
#pragma downcast

var checkpoint : Transform;
public var deathMark : Transform;

function Awake(){
	//checkpoint = transform;
	//checkpoint.position = new Vector3(-5.3, 0.4, 13.1);
	//checkpoint.rotation = Quaternion.identity;
}

function OnSignal () {
	var spawners = GameObject.FindGameObjectsWithTag ("Respawn");
	checkpoint = spawners[ Mathf.Floor( (spawners.length-1) * Random.value)].transform;
	if (NetworkU.IsMine(this)){
		//Team.ammo = 20;
		var myTeam = gameObject.GetComponent(Team).team;
		
		NetworkU.RPC(Camera.main.GetComponent(SpawnAtCheckpoint), "ReportDeath", NetRPCMode.AllBuffered, myTeam);
		//if (myTeam == 1) Team.team1D++;
		//if (myTeam == 2) Team.team2D++;
		NetworkU.RPC(this, "CreateDeathMark", NetRPCMode.All, transform.position);
	}

	transform.position = checkpoint.position + Vector3(0,4,0);
	transform.rotation = checkpoint.rotation;
	
	
	//ResetHealthOnAll ();
}

#if !UNITY_FLASH
@RPC
#endif

function CreateDeathMark(pos : Vector3){
	Instantiate(deathMark, pos, Quaternion.identity);
}
/*
static function ResetHealthOnAll () {
	var healthObjects : Health[] = FindObjectsOfType (Health);
	for (var health : Health in healthObjects) {
		health.dead = false;
		health.health = health.maxHealth;
	}
}
*/