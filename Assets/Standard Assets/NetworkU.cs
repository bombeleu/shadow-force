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
		#if !UNITY_FLASH
		if (UseNet)
			return GameObject.Instantiate(prefab, pos, rot);
		else
		#endif
			return Network.Instantiate(prefab, pos, rot, 0);
	}
	public static void Destroy(Component comp){
		#if !UNITY_FLASH
		if (UseNet)
			GameObject.Destroy(comp.gameObject);
		else
		#endif
			Network.Destroy(comp.networkView.viewID);
	}
	//use the component that contains the RPC function!
	public static void RPC(Component comp, string func, NetRPCMode mode, params object[] paras){
		#if !UNITY_FLASH
		if (UseNet)
			comp.networkView.RPC(func, mode==NetRPCMode.All?RPCMode.All:RPCMode.AllBuffered, paras);
		else
		#endif
		{
			comp.GetType().GetMethod(func).Invoke(comp, paras);
			//gameObject.SendMessage(func, paras);
		}
	}
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
}

