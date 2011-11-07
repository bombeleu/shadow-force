#pragma strict


private var _mesh : Mesh; // current vision mesh
private var _newVertices : Vector3[];
private var _tmpVertices : Vector3[];
private var _newTriangles: int[];

private static var MAX_TRIANGLES : int = 50;
private static var INFINITY : float = 1000.0;

private var _playerTransform : Transform;

public var viewDistance : float = 20;
public var viewAngle : int = 30;
public var visionColor: Color = Color(0.8,0.2,0.3,0.2);

private var _triangleCount : int;

// cached variable
private var _corner : Vector2[] = new Vector2[4];
private var _angleCorner : float[] = new float[4];
private var _result : Vector2[] = new Vector2[4];

static var testCount : int = 0;
function Start() {
	_mesh = GetComponent(MeshFilter).mesh;
	// set position to the ground
	//transform.localPosition.y = 0;
	_playerTransform = transform;
	
	//transform.parent = null;
	_playerTransform.localPosition = Vector3(0,-0.5,0);
	
	_newVertices = new Vector3[2*MAX_TRIANGLES+1];
	_tmpVertices = new Vector3[2*MAX_TRIANGLES+1];
	_newTriangles = new int[3*MAX_TRIANGLES];
	
	for (var i :int = 0 ; i < MAX_TRIANGLES;i++)
	{
		_newTriangles[3*i] = 0;
		_newTriangles[3*i+1] = 2*i+1;
		_newTriangles[3*i+2] = 2*i+2;
		
		//_newVertices[3*i] = Vector3(0,0,0);
		//_tmpVertices[3*i] = Vector3(0,0,0);
	}
	//newTriangles = [0,1,2];
	
	_triangleCount = 0;
	
}

function Update () {
	var player : GameObject ;
	player = GameObject.Find("Player(Clone)");
	if (player == null) return;
	
	//transform.position = _playerTransform.position;
	
	// init mesh vertex
	_mesh.Clear();
	for (var i :int = 0 ; i < 2*MAX_TRIANGLES+1;i++)
	{
		_newVertices[i] = Vector3.zero;
	}
	
	_triangleCount = 1;
	var pt1 : Vector3 = Vector3(-viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),0,viewDistance) ;
	var pt2 : Vector3 = Vector3(viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),0,viewDistance);
	_newVertices[1] = pt1;
	_newVertices[2] = pt2;
	
	var blockers : GameObject[] ;
	blockers = BlockerManager.GetObjsInTriangle(transform.position, transform.localToWorldMatrix.MultiplyPoint(pt1),transform.localToWorldMatrix.MultiplyPoint(pt2));
	//blockers = BlockerManager.GetAllBlockers();
	
//	for (var blocker: GameObject in BlockerManager.GetAllBlockers())
//	{
//		blocker.renderer.material.SetColor("_Color",Color.white);
//	}
	
	//Debug.Log("Visible blockers : " + blockers.Length);
	for (var blocker: GameObject in blockers)
	{
		//Debug.Log("Process blocker at:" + blocker.transform.position);
		//blocker.renderer.material.SetColor("_Color",Color.red);
		Process(blocker);
	}
	
	//Debug.Log("Position" + _playerTransform.position);			
	//Debug.Log("Position" + gameObject.transform.position);			
	
	//Debug.Log(testCount++ + ":" + _playerTransform.position);
	//Debug.Log(pt1 + "|" + pt2);
	
	renderer.material.SetFloat("_Distance",viewDistance);
	renderer.material.SetColor("_VisionColor",visionColor);
	
	_mesh.vertices = _newVertices;
	_mesh.triangles = _newTriangles;
}

private function Process( blocker : GameObject )
{
	if (GetDistance(blocker) == INFINITY) return;
	var mesh : Mesh =  blocker.GetComponent(MeshFilter).mesh;
	//Debug.Log("Process Blocker at position " + blocker.transform.position);
	var i : int;
	var currentTriangleCount : int = _triangleCount;
	// process each triangle
	_triangleCount = 0 ;
	for (i = 0 ; i < currentTriangleCount; i++)
	{
		//Debug.Log("Process triangle : " + _newVertices[2*i+1].x + "," + _newVertices[2*i+1].z + "---" + _newVertices[2*i+2].x + "," +_newVertices[2*i+2].z);
		var intersectPts : Vector2[] = GetIntersectPts(Vector2.zero,
													 Vector2(_newVertices[2*i+1].x,_newVertices[2*i+1].z),
													 Vector2(_newVertices[2*i+2].x,_newVertices[2*i+2].z),
													 blocker);
		// intersect
		if (intersectPts[0] != Vector2.zero || intersectPts[3] != Vector2.zero ||
			intersectPts[1] != Vector2.zero || intersectPts[2] != Vector2.zero)
		{
//			Debug.Log(intersectPts[0] +","+intersectPts[1]+","+intersectPts[2]+","+intersectPts[3]);
//			var intersectPt1 : Vector2 = Vector2(intersectPts.x,intersectPts.y);
//			var intersectPt2 : Vector2 = Vector2(intersectPts.z,intersectPts.w);
//			if (intersectPt1 != Vector2.zero)
			if (intersectPts[0] != Vector2.zero)
			{
				_tmpVertices[2*_triangleCount+1] = _newVertices[2*i+1];
				_tmpVertices[2*_triangleCount+2] = Vector3(intersectPts[0].x, 0, intersectPts[0].y);
				_triangleCount++;
				//Debug.Log("add left point " + _triangleCount);
			}
			
			//Debug.Log("test1");
			_tmpVertices[2*_triangleCount+1] = Vector3(intersectPts[1].x, 0, intersectPts[1].y);
			_tmpVertices[2*_triangleCount+2] = Vector3(intersectPts[2].x, 0, intersectPts[2].y);
			_triangleCount++;
			//Debug.Log("add middle point" + _triangleCount);
			if (intersectPts[3] != Vector2.zero)
			{
				_tmpVertices[2*_triangleCount+1] = Vector3(intersectPts[3].x, 0, intersectPts[3].y);
				_tmpVertices[2*_triangleCount+2] = _newVertices[2*i+2];
				_triangleCount++;
				//Debug.Log("add right point" + _triangleCount);
			}
			
		} else
		{
			//_tmpVertices[3*_triangleCount] = _playerTransform.position;
			_tmpVertices[2*_triangleCount+1] = _newVertices[2*i+1];
			_tmpVertices[2*_triangleCount+2] = _newVertices[2*i+2];
			_triangleCount++;
		}
		//Debug.Log("triangle : " + _newVertices[2*i+1].x + "," + _newVertices[2*i+1].z + "---" + _newVertices[2*i+2].x + "," +_newVertices[2*i+2].z);
	}
	
	//Debug.Log("Triangle Count:" + _triangleCount);
	//_newVertices = _tmpVertices;
	for (i = 1 ; i <= 2*_triangleCount; i++)
	{
		_newVertices[i] = _tmpVertices[i];
		//Debug.Log(_newVertices[i]);
		//Debug.Log(_newTriangles[i]);
	}
	
}

private function GetDistance(blocker : GameObject) : float
{
	var distance: float;
	if (BlockerManager.IsCylinder(blocker))
	{
		//return INFINITY;
		// handle cylinder shape
		//var v : Vector4 = FindIntersectWith(blocker);
		distance = (_playerTransform.position - blocker.transform.position).magnitude 
		           - Mathf.Max(blocker.transform.localScale.x,blocker.transform.localScale.z);
		
		return (distance > viewDistance) ? INFINITY : distance;
	} else 
	{
		distance = (_playerTransform.position - blocker.transform.position).magnitude 
					- Mathf.Max(blocker.transform.localScale.x,blocker.transform.localScale.z);
		
		return (distance > viewDistance) ? INFINITY : distance;
	}
	
	return INFINITY;
}

private function GetAngleValue(v : Vector2) : float
{
	var sign : int;
	var REGION_ANGLE : float = 1000;
	// first, get sign
	if (v.y < 0)
	{
		if (v.x < 0) return v.x/v.y;
		else return 3 * REGION_ANGLE - v.y/v.x ;
	} else 
	{
		if (v.x < 0) return REGION_ANGLE + -v.y/v.x;
		else return 2*REGION_ANGLE + v.x/v.y;
	}
	//return ( sign * 360 + Vector2.Angle(v,Vector2.up));
	//return ( sign * 10000 + v.x / v.z);
}

private function GetIntersectPts(pt0 : Vector2, pt1 : Vector2, pt2 : Vector2, blocker : GameObject)
{
	//var _result : Vector4 = Vector4.zero;
	var leftMost : Vector2 ;
	var rightMost : Vector2;
	var temp : Vector3;

	_result[0] = _result[1] = _result[2] = _result[3] = Vector2.zero;
	if (BlockerManager.IsCylinder(blocker))
	{
		//return _result;
		// find the intersection of the triangle and the circle
		/*
		http://paulbourke.net/geometry/2circle/
		http://www.mathopenref.com/consttangents.html 
		*/
		//var point : Vector2 = Vector2(transform.position.x,transform.position.z);
		var point : Vector2 = Vector2.zero;
		//var center : Vector2 = Vector2(blocker.transform.position.x, blocker.transform.position.z);
		temp = _playerTransform.InverseTransformPoint(blocker.transform.position);
		var center : Vector2 = Vector2(temp.x,temp.z);
		var r0 : float = blocker.transform.localScale.x * 0.5;
		
		// find the mid point
		var midPoint : Vector2 = 0.5 * (point+center);
		var r1 : float = (midPoint-center).magnitude;
		
		var a : float = (r0*r0)/(2*r1);
		var h : float = Mathf.Sqrt(r0*r0-a*a);
		var p2 : Vector2 = center + (a/r1)*(midPoint-center);
		
		//x3 = x2 +- h ( y1 - y0 ) / d
		//y3 = y2 -+ h ( x1 - x0 ) / d
		var hd : float = h/r1;
		leftMost  = Vector2(p2.x + hd*(midPoint.y-center.y),p2.y - hd*(midPoint.x-center.x));
		rightMost = Vector2(p2.x - hd*(midPoint.y-center.y),p2.y + hd*(midPoint.x-center.x));
		
	
	} else
	{
		var mat : Matrix4x4 = _playerTransform.worldToLocalMatrix * blocker.transform.localToWorldMatrix;
		var size : float = 0.5;
		// get the 4 _corners
		temp = mat.MultiplyPoint3x4(Vector3(-size,0,-size));_corner[0]  = Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint3x4(Vector3(-size,0,size));_corner[1]  = Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint3x4(Vector3(size,0,size));_corner[2]  = Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint3x4(Vector3(size,0,-size));_corner[3]  = Vector2(temp.x,temp.z);
		
		
		var sign01 : float = Sign2(_corner[0],_corner[1]) ;
		var sign12 : float = Sign2(_corner[1],_corner[2]) ;
		var sign23 : float = Sign2(_corner[3],_corner[2]) ;
		var sign30 : float = Sign2(_corner[0],_corner[3]) ;
		
		if (sign01 * sign23 > 0)
		{
			if (sign12 * sign30 > 0)
			{
				if (Mathf.Abs(sign01) < Mathf.Abs(sign23))
				{
					if (Mathf.Abs(sign12) < Mathf.Abs(sign30))
					{
						leftMost = _corner[0];rightMost = _corner[2];
					} else
					{
						leftMost = _corner[1];rightMost = _corner[3];
					}
				} else
				{
					if (Mathf.Abs(sign12) < Mathf.Abs(sign30))
					{
						leftMost = _corner[1];rightMost = _corner[3];
					} else
					{
						leftMost = _corner[2];rightMost = _corner[0];
					}
				}
			
			} else
			{
				if (Mathf.Abs(sign01) < Mathf.Abs(sign23))
				{
					leftMost = _corner[0];rightMost = _corner[1];
				} else
				{
					leftMost = _corner[2];rightMost = _corner[3];
				}
			}
		} else 
		{
			//if (sign12 * sign30 < 0) Debug.Log("SOMETHING WRONG !!");	
			if (Mathf.Abs(sign12) < Mathf.Abs(sign30))
			{
				leftMost = _corner[1];rightMost = _corner[2];
			} else
			{
				leftMost = _corner[3];rightMost = _corner[0];
			}
		} 
		/*
		for (var i : int = 0; i < 4; i++)
		{
			_angleCorner[i] = GetAngleValue(_corner[i]);
		}
	
		var min : int = 0;
		var max : int = 0;
		for (i = 1; i < 4; i++)
		{
			if (_angleCorner[i] < _angleCorner[min]) min = i;
			if (_angleCorner[i] > _angleCorner[max]) max = i;
		}
		leftMost = _corner[min];rightMost = _corner[max];
		*/
		//Debug.Log("4 _corner:" + _corner[0] + " | "+ _corner[1] + " | "+ _corner[2] + " | "+ _corner[3]);
		//Debug.Log("Left - right" + leftMost + "," + rightMost);
		//Debug.Log(_angleCorner[0] + ","+_angleCorner[1]+","+_angleCorner[2]+","+_angleCorner[3]);
		//Debug.Log(sign01 + ","+sign12+","+sign23+","+sign30);
	}
	
	
	// now we got 2 intersection point, need to determine how to break it
	// ip1 supposed to be on the left side, swap if not
	if (GetAngleValue(leftMost) > GetAngleValue(rightMost))
	{
		var temp2 : Vector2 = leftMost;leftMost = rightMost; rightMost = temp2;
	}
		
	// we got the block line [leftMost,rightMost], now calculate the intersect point
	var intersectPt1 : Vector2 = LineIntersectLine(pt0,pt1,leftMost,rightMost,false);
	var intersectPt2 : Vector2 = LineIntersectLine(pt0,pt2,leftMost,rightMost,false);
	var intersectPt3 : Vector2 = LineIntersectLine(pt1,pt2,leftMost,rightMost,false);
	//Debug.Log("Intersect Pts:" + intersectPt1 + " | " + intersectPt2 + "|" + intersectPt3);
	if (intersectPt1 != Vector2.zero)
	{
		_result[1] = intersectPt1;
		if (intersectPt2 != Vector2.zero) // intersect 1,2
		{
			_result[2] = intersectPt2;
		} else if (intersectPt3 != Vector2.zero) // intersect 1,3
		{
			_result[2] = intersectPt3;
			_result[3] = intersectPt3;
		} else // only intersect 1
		{
			if (IsPointInTri(rightMost,pt0,pt1,pt2))
			{
				_result[2] = rightMost;
				_result[3] = LineIntersectLine(pt0,rightMost,pt1,pt2,true);
			} else
			{
				_result[2] = leftMost;
				_result[3] = LineIntersectLine(pt0,leftMost,pt1,pt2,true);
			}
		}
	} else
	{
		if (intersectPt2 != Vector2.zero)
		{
			_result[2] = intersectPt2;
			if (intersectPt3 != Vector2.zero) // intersect 2,3
			{
				_result[0] = intersectPt3;
				_result[1] = intersectPt3;
			} else // intersect 2 only
			{
				if (IsPointInTri(leftMost,pt0,pt1,pt2))
				{
					_result[0] = LineIntersectLine(pt0,leftMost,pt1,pt2,true);
					_result[1] = leftMost;
				} else
				{
					_result[0] = LineIntersectLine(pt0,rightMost,pt1,pt2,true);
					_result[1] = rightMost;
				}
			}
		} else 
		{
			if (intersectPt3 != Vector2.zero) // intersect 3 only
			{
				if (IsPointInTri(leftMost,pt0,pt1,pt2)) // pt1 inside
				{
					_result[0] = LineIntersectLine(pt0,leftMost,pt1,pt2,true);
					_result[1] = leftMost;
					_result[2] = intersectPt3;
					_result[3] = intersectPt3;	
				} else // pt2 must be inside
				{
					_result[0] = intersectPt3;
					_result[1] = intersectPt3;
					_result[2] = rightMost;
					_result[3] = LineIntersectLine(pt0,rightMost,pt1,pt2,true);
				}
			} else if (IsPointInTri(leftMost,pt0,pt1,pt2))// no intersections, both pts are inside triangle
			{
				_result[0] = LineIntersectLine(pt0,leftMost,pt1,pt2,true);
				_result[1] = leftMost;
				_result[2] = rightMost;
				_result[3] = LineIntersectLine(pt0,rightMost,pt1,pt2,true);
			}
		}
	}

	//Debug.Log("Result is:" + _result[0]+"||"+_result[1]+"||"+_result[2]+"||"+_result[3]);
	
	return _result;
}

private function perp(u : Vector2, v : Vector2) : float
{
	return u.x*v.y - u.y*v.x;
}
// find the intersect of 2 line segments ( p0,p1) and (p2,p3)
private function LineIntersectLine(p0 : Vector2, p1 : Vector2,p2 : Vector2, p3 : Vector2, p0IsRay : boolean) : Vector2
{
	/*
	http://softsurfer.com/Archive/algorithm_0104/algorithm_0104B.htm#Line%20Intersections
	*/
	var u : Vector2 = p1 - p0;    // segment S1
    var v : Vector2 = p3 - p2;    // segment S2
    var w : Vector2 = p0 - p2;
    var D : float = perp(u,v);
    
    var sI : float  = perp(v,w) / D;
    if (sI < 0 || (!p0IsRay && sI > 1))               // no intersect with S1
    {
    	//Debug.Log("Source :" + sI + "|" + D + "|" + perp(v,w));
        return Vector2.zero;
    }

    // get the intersect parameter for S2
    var tI : float = perp(u,w) / D;
    if (tI < 0 || tI > 1)               // no intersect with S2
    {
    	//Debug.Log("Target " + tI);
        return Vector2.zero;
    }

	return (p0 + sI*u);  // compute S1 intersect point
}
// return the intersection point of a line segments (p1,p2) with the circle
private function LineIntersectCircle(p1 : Vector2, p2 : Vector2, center : Vector2, r : float) : Vector2
{
	/*
	http://mathworld.wolfram.com/Circle-LineIntersection.html
	*/
	var dx : float = p2.x - p1.x ;
	var dy : float = p2.y - p1.y ;
	var dr2 : float = dx*dx + dy*dy;
	var det: float = (p1.x-center.x)*(p2.y-center.y) - (p1.y-center.y)*(p2.x-center.x);
	var sgndy : float = 1; if (dy < 0) sgndy = -1;
	var delta : float = r*r*dr2 - det*det;
	if (delta < 0 ) return Vector2.zero;
	var sqrtDelta : float  = Mathf.Sqrt(delta)	;
	var v1 : Vector2 = Vector2(det*dy-sgndy*dx*sqrtDelta,-det*dx-Mathf.Abs(dy)*sqrtDelta)/dr2 + center;
	var v2 : Vector2 = Vector2(det*dy-sgndy*dx*sqrtDelta,-det*dx-Mathf.Abs(dy)*sqrtDelta)/dr2 + center;
	
	return v1;
}

private function Sign2(p1 : Vector2, p2 : Vector2) : float
{
	return p2.y*p1.x - p2.x*p1.y;
}

private function Sign(p1 : Vector2, p2 :Vector2, p3 :Vector2) : float 
{  
	return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

private function IsPointInTri(pt :Vector2, v1:Vector2, v2:Vector2, v3:Vector2) : boolean
{  
	var b1: boolean;  var b2: boolean;  var b3: boolean;  
	b1 = Sign(pt, v1, v2) < 0.0f;  b2 = Sign(pt, v2, v3) < 0.0f;  b3 = Sign(pt, v3, v1) < 0.0f;  
	return ((b1 == b2) && (b2 == b3));
}

