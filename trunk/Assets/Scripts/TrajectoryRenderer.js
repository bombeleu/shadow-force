#pragma strict
@script RequireComponent (LineRenderer)

public var trajectory: PerFrameTrajectory;
public var vertexNumber:int=20;
public var spawnPoint:Transform;

private var lRenderer:LineRenderer;
function Awake(){
	lRenderer = gameObject.GetComponent (LineRenderer) as LineRenderer;	
}

function Update () {
	var velo:Vector3 = trajectory.GetComputedVelocity();
	var duration:float = trajectory.GetDuration();
	
	lRenderer.SetVertexCount(vertexNumber+1);
	
	for(var i:int=0; i<=vertexNumber; i++){
		var t = i*duration/vertexNumber;
		lRenderer.SetPosition(i, spawnPoint.position + velo*t + 0.5*Physics.gravity*t*t);
	}
}