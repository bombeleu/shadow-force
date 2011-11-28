#pragma strict
public var explosionPrefab : GameObject;

function OnDead():void{
	networkView.RPC("_OnDead", RPCMode.All);
}

@RPC
function _OnDead():void{
	DestroyObject(gameObject);
	Instantiate(explosionPrefab, transform.position, transform.rotation);
}
