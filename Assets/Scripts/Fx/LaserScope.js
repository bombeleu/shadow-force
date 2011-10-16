#pragma strict 

@script RequireComponent (PerFrameRaycast)

public var scrollSpeed : float = 0.5;
public var pulseSpeed : float = 1.5;

public var noiseSize : float = 1.0;

public var maxWidth : float = 0.5;
public var minWidth : float = 0.2;

public var pointer : GameObject = null;

public var reflect : boolean = false;

private var lRenderer : LineRenderer;
private var aniTime : float = 0.0;
private var aniDir : float = 1.0;

private var raycast : PerFrameRaycast;

function Start() {
	lRenderer = gameObject.GetComponent (LineRenderer) as LineRenderer;	
	aniTime = 0.0;
	
	// Change some animation values here and there
	ChoseNewAnimationTargetCoroutine();
	
	raycast = GetComponent.<PerFrameRaycast> ();
}

function ChoseNewAnimationTargetCoroutine () {
	while (true) {
		aniDir = aniDir * 0.9 + Random.Range (0.5, 1.5) * 0.1;
		yield;
		minWidth = minWidth * 0.8 + Random.Range (0.1, 1.0) * 0.2;
		yield WaitForSeconds (1.0 + Random.value * 2.0 - 1.0);	
	}	
}

function Update () {
	renderer.material.mainTextureOffset.x += Time.deltaTime * aniDir * scrollSpeed;
	renderer.material.SetTextureOffset ("_NoiseTex", Vector2 (-Time.time * aniDir * scrollSpeed, 0.0));

	var aniFactor : float = Mathf.PingPong (Time.time * pulseSpeed, 1.0);
	aniFactor = Mathf.Max (minWidth, aniFactor) * maxWidth;
	lRenderer.SetWidth (aniFactor, aniFactor);
	
	// Cast a ray to find out the end point of the laser
	var hitInfo : RaycastHit = raycast.GetHitInfo ();
	if (hitInfo.transform) {
		lRenderer.SetVertexCount(reflect?3:2);
		var firstPos : Vector3 = (hitInfo.distance * Vector3.forward);
		lRenderer.SetPosition (1, firstPos);
		
		if (reflect){
			var localNorm:Vector3 = transform.worldToLocalMatrix.MultiplyVector(hitInfo.normal);
			var dir:Vector3 = Vector3.forward - localNorm * Vector3.Dot(Vector3.forward, localNorm) * 2;
			dir.y = 0;
			var secondHit:RaycastHit = RaycastHit ();
			Physics.Raycast (transform.localToWorldMatrix.MultiplyPoint(firstPos /*+ dir.normalized*/), 
				transform.localToWorldMatrix.MultiplyVector(dir), secondHit);
			lRenderer.SetPosition (2, firstPos + secondHit.distance * dir);
			//dir -= norm * Vector3.Dot(dir, norm) * 2;
    		//dir.y = 0;
		}
		renderer.material.mainTextureScale.x = 0.1 * (hitInfo.distance);
		renderer.material.SetTextureScale ("_NoiseTex", Vector2 (0.1 * hitInfo.distance * noiseSize, noiseSize));		
		
		// Use point and normal to align a nice & rough hit plane
		if (pointer) {
			pointer.renderer.enabled = true;
			pointer.transform.position = hitInfo.point + (transform.position - hitInfo.point) * 0.01;
			pointer.transform.rotation = Quaternion.LookRotation (hitInfo.normal, transform.up);
			pointer.transform.eulerAngles.x = 90.0;
		}
	}
	else {
		lRenderer.SetVertexCount(2);
		if (pointer)
			pointer.renderer.enabled = false;		
		var maxDist : float = 200.0;
		lRenderer.SetPosition (1, (maxDist * Vector3.forward));
		renderer.material.mainTextureScale.x = 0.1 * (maxDist);		
		renderer.material.SetTextureScale ("_NoiseTex", Vector2 (0.1 * (maxDist) * noiseSize, noiseSize));		
	}
}
