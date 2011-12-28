#if UNITY_FLASH
	#define SINGLE_PLAYER
#endif

using UnityEngine;
using System.Collections;
//using System.Reflection;

public enum NetRPCMode{
	All,
	AllBuffered
}

public class NetworkU: MonoBehaviour{
	public static bool UseNet = false;
	public static Object Instantiate(Transform prefab, Vector3 pos, Quaternion rot){
		#if !UNITY_FLASH
		if (UseNet)
			return Network.Instantiate(prefab, pos, rot, 0);
		else
		#endif
			return GameObject.Instantiate(prefab, pos, rot);
	}
	public static void Destroy(Component comp){
		#if !UNITY_FLASH
		if (UseNet)
			Network.Destroy(comp.networkView.viewID);
		else
		#endif
			GameObject.Destroy(comp.gameObject);
	}
	#if !UNITY_FLASH
	//use the component that contains the RPC function!
	public static void RPC(Component comp, string func, NetRPCMode mode, params object[] paras){
		if (UseNet)
			comp.networkView.RPC(func, mode==NetRPCMode.All?RPCMode.All:RPCMode.AllBuffered, paras);
		else
		{
			comp.GetType().GetMethod(func).Invoke(comp, paras);
			//gameObject.SendMessage(func, paras);
		}
	}
	#endif
	public static bool IsMine(Component comp){
		#if !UNITY_FLASH
		if (UseNet){
			return comp.networkView.isMine;
		}
		else
		#endif
		{
			return true;
		}
	}
	#if UNITY_FLASH
	public static int AllocateID(){
		return 0;
	}
	#else
	public static NetworkViewID AllocateID(){
		if (UseNet){
			return Network.AllocateViewID();
		}else{
			return NetworkViewID.unassigned;
		}
	}
	#endif
	public static float SendRate(){
		#if !UNITY_FLASH
		if (UseNet){
			return Network.sendRate;
		}
		else
		#endif
		{
			return 15;
		}
	}
	/*
	public static int GetID(GameObject obj){
		return obj.GetInstanceID();
	}*/
	#if UNITY_FLASH
	public static object[,] CellArray (int a, int b) {
        return new object[a,b];
    }

	//private NavMeshAgent Agent;
	public static void InitNav(Object nav){
		nav.GetType().GetProperty("updatePosition").SetValue(nav, false, null);
		nav.GetType().GetProperty("updateRotation").SetValue(nav, false, null);
	}
	
	public static bool NavSetDest(Object nav, Vector3 dest){
		//return (bool)(nav.GetType().GetMethod("SetDestination").Invoke(nav, new object[]{dest}));
		nav.GetType().GetProperty("destination").SetValue(nav, dest, null);
		return true;
	}
	
	public static Vector3 NavNextPos(Object nav){
		return (Vector3)(nav.GetType().GetProperty("nextPosition").GetValue(nav, null));
	}
	#endif
}

