#pragma strict

	//these function should be moved to another global file!
	public var prefabs: GameObject[];
	private static var instance: NetInstantiate;
	function Awake(){
		instance = this;
	}
	static function CreateTeamObject(prefab:GameObject, 
		#if UNITY_FLASH
		viewID:int, 
		#else
		viewID:NetworkViewID, 
		#endif
		pos:Vector3, quat: Quaternion, team:int):void
	{
		var i:int = instance.GetPrefabID(prefab);
		#if UNITY_FLASH
		instance._CreateTeamObject(i, viewID, pos, quat, team); 
		#else
		NetworkU.RPC(instance, "_CreateTeamObject", NetRPCMode.AllBuffered, [i, viewID, pos, quat, team]); 
		#endif
	}
	
	function GetPrefabID(prefab:GameObject):int{
		var i:int;
		for (i=0; i<prefabs.length; i++){
			if (prefab == prefabs[i]) break;
		}
		return i;	
	}
	
	#if !UNITY_FLASH
	@RPC
	#endif
	function _CreateTeamObject(prefabID:int, 
		#if UNITY_FLASH
		viewID:int, 
		#else
		viewID:NetworkViewID, 
		#endif
		pos:Vector3, quat: Quaternion, team:int):void
	{
		//Debug.Log(prefabID);
		var go:GameObject = Instantiate(prefabs[prefabID], pos, quat);
		go.GetComponent.<Team>().SetTeam(team);
		#if !UNITY_FLASH
			go.networkView.viewID = viewID;
		#endif
	}