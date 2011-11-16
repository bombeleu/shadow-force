public var lifeTime:float = 1;
private var _timer:float;

function Awake(){
	_timer = Time.time;

}

function Update () {
	
	if (Time.time - _timer > lifeTime)
	{
		//Debug.Log("done:" + Time.time);
		var emitter : ParticleEmitter = gameObject.GetComponent(ParticleEmitter) as ParticleEmitter;
		emitter.emit = false;
	} 
		//Network.Destroy(networkView.viewID);
}
