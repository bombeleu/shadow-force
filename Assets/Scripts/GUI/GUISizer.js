#pragma strict

public class GUISizer
{
	static var width : float = 960;
	static var height : float = 600;
	
	static var scale : float;
	static var offset : Vector3 ;
	public static var rotationAngle : float;
	
	static var stack : ArrayList = new ArrayList();
	
	public static var guiOffset : Vector3 = Vector3.zero;
	
	
	public static function BeginGUI () {
		//GUISizer.width = width;
		//GUISizer.height = height;
		Debug.Log(GUI.matrix);
		stack.Add (GUI.matrix);
		var m : Matrix4x4 = new Matrix4x4 ();
		ComputeScaleAndOffset();
		m.SetTRS(offset+guiOffset, Quaternion.identity, Vector3.one * scale);
		GUI.matrix *= m;
	}

	public static function EndGUI () {
		GUI.matrix = stack[stack.Count - 1];
		stack.RemoveAt (stack.Count - 1);
	}
	
	public static function ApplyToTransformForOrthogonalProjection( rect : Rect,  transform : Transform) {
		ComputeScaleAndOffset();
		transform.position = new Vector3((2 * (rect.x * scale + offset.x)) - Screen.width, Screen.height - (2 * ((rect.y + rect.height) * scale + offset.y)), 0.0f);
		transform.rotation = Quaternion.identity;
		transform.localScale = Vector3.one * 2.0f * scale;
	}
	
	private static function ComputeScaleAndOffset() {
		var w : float = Screen.width;
		var h : float = Screen.height;
		var aspect : float = w / h;
		scale = 1f;
		offset = Vector3.zero;
		if (aspect < (width / height)) {
			//screen is taller
			scale = (Screen.width / width);
			offset.y += (Screen.height - (height * scale)) * 0.5f;
			
		} else {
			// screen is wider
			scale = (Screen.height / height);
			offset.x += (Screen.width - (width * scale)) * 0.5f;
		}
	}
}
