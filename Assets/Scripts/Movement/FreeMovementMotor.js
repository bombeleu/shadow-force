#pragma strict

//@script RequireComponent (Rigidbody)

class FreeMovementMotor extends MovementMotor {
	public static var ControllerOffset:float = 0.01;
	//public var movement : MoveController;
	public var walkingSpeed : float = 5.0;
	public var walkingSnappyness : float = 50;
	//public var turningSmoothing : float = 0.3;
	public var maxTurnSpeed: float = 7;
	public static var threshold : float = 5;
	
	//public var disableRotation
	
	private var curAngle:float = 0;
	function FixedUpdate () {
		// Handle the movement of the character
		var targetVelocity : Vector3 = movementDirection * walkingSpeed;
		var controller:CharacterController = GetComponent(CharacterController);
		if (controller){
			if (targetVelocity == Vector3.zero) targetVelocity = Vector3(Random.value-0.5, 0, Random.value-0.5)*ControllerOffset;//TODO: this hack is used to enable collision detection because static Character controller will sleep
			if (!controller.isGrounded) targetVelocity+= Physics.gravity*Time.deltaTime;
			controller.SimpleMove(targetVelocity);
		}else{
			var deltaVelocity : Vector3 = targetVelocity - rigidbody.velocity;
			if (rigidbody.useGravity)
				deltaVelocity.y = 0;
			rigidbody.AddForce (deltaVelocity * walkingSnappyness, ForceMode.Acceleration);
		}
		// Setup player to face facingDirection, or if that is zero, then the movementDirection
		var faceDir : Vector3 = facingDirection;
		var anguVelo:float;
		if (faceDir == Vector3.zero)
			faceDir = movementDirection;
		
		// Make the character rotate towards the target rotation
		if (faceDir == Vector3.zero) {
			//rigidbody.angularVelocity = Vector3.zero;
			anguVelo = 0;
		}
		else {
			var rotationAngle : float = AngleAroundAxis (transform.forward, faceDir, Vector3.up);
			//rigidbody.angularVelocity = (Vector3.up * rotationAngle * turningSmoothing);
			if (Mathf.Abs(rotationAngle)>threshold){
				rotationAngle = rotationAngle>0?maxTurnSpeed:-maxTurnSpeed;
			}
			//rigidbody.angularVelocity = (Vector3.up * rotationAngle);
			anguVelo = rotationAngle;
		}
		if (controller){
			curAngle += Time.deltaTime * anguVelo;
			transform.rotation = Quaternion.AxisAngle(Vector3.up, curAngle);
		}else{
			rigidbody.angularVelocity = (Vector3.up * anguVelo);
		}
	}
	
	// The angle between dirA and dirB around axis
	static function AngleAroundAxis (dirA : Vector3, dirB : Vector3, axis : Vector3) {
	    // Project A and B onto the plane orthogonal target axis
	    dirA = dirA - Vector3.Project (dirA, axis);
	    dirB = dirB - Vector3.Project (dirB, axis);
	   
	    // Find (positive) angle between A and B
	    var angle : float = Vector3.Angle (dirA, dirB);
	   
	    // Return angle multiplied with 1 or -1
	    return angle * (Vector3.Dot (axis, Vector3.Cross (dirA, dirB)) < 0 ? -1 : 1);
	}
	
}
