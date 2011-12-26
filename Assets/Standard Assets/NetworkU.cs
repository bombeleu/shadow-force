#if UNITY_FLASH
	#define SINGLE_PLAYER
#endif

using UnityEngine;
using System.Collections;
using System.Reflection;

public enum NetRPCMode{
	All,
	AllBuffered
}

public class NetworkU: MonoBehaviour{
	public static bool UseNet = false;
	public static Object Instantiate(Transform prefab, Vector3 pos, Quaternion rot){
		#if SINGLE_PLAYER
			return GameObject.Instantiate(prefab, pos, rot);
		#else
			return Network.Instantiate(prefab, pos, rot, 0);
		#endif
	}
	public static void Destroy(GameObject gameObject){
		#if SINGLE_PLAYER
			GameObject.Destroy(gameObject);
		#else
			Network.Destroy(gameObject);
		#endif
	}
	public static void RPC(Component gameObject, string func, NetRPCMode mode, params object[] paras){
		if (UseNet)
			gameObject.networkView.RPC(func, mode==NetRPCMode.All?RPCMode.All:RPCMode.AllBuffered, paras);
		else{
			gameObject.GetType().GetMethod(func).Invoke(gameObject, paras);
			//gameObject.SendMessage(func, paras);
		}
	}
}

