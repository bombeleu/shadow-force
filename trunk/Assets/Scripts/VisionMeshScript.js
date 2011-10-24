private var _mesh : Mesh;
private var _newVertices : Vector3[];
private var _tmpVertices : Vector3[];
private var _newTriangles: int[];

private static var MAX_TRIANGLES : int = 100;
private static var INFINITY : float = 1000.0;
private var _blockers : GameObject[];
private var _blockersDistance: float[];
//private var _playerTransform : Transform;

public var viewDistance : float = 20;
public var viewAngle : int = 30;

private var _triangleCount : int;

// cached variable
private var corner : Vector2[] = new Vector2[4];
private var angleCorner : float[] = new float[4];
private var result : Vector2[] = new Vector2[4];
function Start() {
	_mesh = GetComponent(MeshFilter).mesh;
	// set position to the ground
	//transform.localPosition.y = 0;
	//_playerTransform = transform.parent;
	
	//transform.parent = null;
	transform.localPosition = Vector3(0,-0.5,0);
	
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
	
	// initialize static blockers
	_blockers = GameObject.FindGameObjectsWithTag("Blocker");
	_blockersDistance = new float[_blockers.Length];
	Debug.Log("We have " + _blockers.Length + " blockers");
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
		_newVertices[i] = Vector3(0,0,0);
	}
	
	_triangleCount = 1;
	
	AddTriangle(0,
				Vector3(-viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),0,viewDistance) ,
				Vector3(viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),0,viewDistance));
				//Vector3(0,0,viewDistance));
	//Debug.Log("Angle");
	//Debug.Log(Vector2.Dot(Vector2(-viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),viewDistance),Vector2.up));
	//Debug.Log(Vector2.Dot(Vector2(viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),viewDistance),Vector2.up));
	//Debug.Log(Sign(Vector2(-viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle)+5,viewDistance),Vector2.zero,Vector2(-viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),viewDistance)));
	//Debug.Log(Sign(Vector2(-viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle)-5,viewDistance),Vector2.zero,Vector2(-viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),viewDistance)));
	SortBlockers();
	
	for (var blocker: GameObject in _blockers)
	{
		Process(blocker);
	}
			
	//Process(_blockers[0]);
	

	_mesh.vertices = _newVertices;
	_mesh.triangles = _newTriangles;
}

private function GetDistance(blocker : GameObject) : float
{
	var distance: float;
	if (IsCylinder(blocker))
	{
		return INFINITY;
		// handle cylinder shape
		//var v : Vector4 = FindIntersectWith(blocker);
		distance = (transform.position - blocker.transform.position).magnitude 
		           - Mathf.Max(blocker.transform.localScale.x,blocker.transform.localScale.z);
		
		return (distance > viewDistance) ? INFINITY : distance;
	} else 
	{
		distance = (transform.position - blocker.transform.position).magnitude;
		
		return (distance > viewDistance) ? INFINITY : distance;
	}
	
	return INFINITY;
}

private function SortBlockers()
{
	var i : int;
	var j : int;
	
	// calculate distance first
	for ( i = 0 ; i < _blockers.Length;i++)
	{
		_blockersDistance[i] = GetDistance(_blockers[i]);
	}
	
	// do bubble sort
  	for (i = 0 ; i < _blockers.Length - 1;i++)
  	{
  		for ( j = i + 1 ; j < _blockers.Length;j++)
  		{
  			if (_blockersDistance[i] > _blockersDistance[j])
  			{
  				// swap
  				var tempObj : GameObject = _blockers[i];
  				_blockers[i] = _blockers[j];_blockers[j] = tempObj;
  				
  				var tempDist : float = _blockersDistance[i];
  				_blockersDistance[i] = _blockersDistance[j];_blockersDistance[j] = tempDist;
  			}
  		}
  	}
}

private function AddTriangle(index : int, pt1 : Vector3, pt2 : Vector3)
{
	//_newVertices[index*3] = transform.position;
	_newVertices[index*2 + 1] = pt1;
	_newVertices[index*2 + 2] = pt2;
}

private function IsCylinder(blocker : GameObject) : boolean
{
	if (blocker.name.Equals("Cylinder Instance") || blocker.name.Equals("Cylinder")) return true;
	else return false;
}

private function GetAngleValue(v : Vector2) : float
{
	var sign : int;
	var REGION_ANGLE : float = 10000;
	// first, get sign
	if (v.y < 0)
	{
		if (v.x < 0) return 0;
		else return 3 * REGION_ANGLE;
	} else 
	{
		if (v.x < 0) return REGION_ANGLE + v.x/v.y;
		else return 2*REGION_ANGLE + v.x/v.y;
	}
	//return ( sign * 360 + Vector2.Angle(v,Vector2.up));
	//return ( sign * 10000 + v.x / v.z);
}

private function GetIntersectPts(pt0 : Vector2, pt1 : Vector2, pt2 : Vector2, blocker : GameObject)
{
	//var result : Vector4 = Vector4.zero;

	if (IsCylinder(blocker))
	{
		// find the intersection of the triangle and the circle
		//var dot1 : float = Vector2.Dot(pt1-pt0,Vector2(blocker.transform.position.x,blocker.transform.position.z));
		//var dot2 : float = Vector2.Dot(Vector2(blocker.transform.position.x,blocker.transform.position.z),pt2-pt0);
		
		/*
		http://paulbourke.net/geometry/2circle/
		http://www.mathopenref.com/consttangents.html 
		*/
		//var point : Vector2 = Vector2(transform.position.x,transform.position.z);
		var point : Vector2 = Vector2.zero;
		//var center : Vector2 = Vector2(blocker.transform.position.x, blocker.transform.position.z);
		var temp : Vector3 = transform.InverseTransformPoint(blocker.transform.position);
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
		var tangent1 : Vector2 = Vector2(p2.x + hd*(midPoint.y-center.y),p2.y - hd*(midPoint.x-center.x));
		var tangent2 : Vector2 = Vector2(p2.x - hd*(midPoint.y-center.y),p2.y + hd*(midPoint.x-center.x));
		
		//Debug.Log("Tangent :" + tangent1 + "---" + tangent2);
		// now we got 2 intersection point, need to determine how to break it
		// ip1 supposed to be on the left side, swap if not
		if (Sign(tangent1,Vector2.zero,Vector2.up) < Sign(tangent2,Vector2.zero,Vector2.up))
		{
			temp = tangent1;tangent1 = tangent2; tangent2 = temp;
			//Debug.Log("Come here1");
		}
	
		if (IsPointInTri(tangent1,pt0,pt1,pt2))
		{
			//Debug.Log("Come here2");
			result[0] = LineIntersectLine(pt0,tangent1,pt1,pt2,true);
			result[1] = tangent1;
		} else
		{
			result[1] = LineIntersectCircle(pt0,pt1,center,r0);
		}
		
		if (IsPointInTri(tangent2,pt0,pt1,pt2))
		{
			//Debug.Log("Come here3");
			result[2] = tangent2;
			result[3] = LineIntersectLine(pt0,tangent2,pt1,pt2,true);
		} else
		{
			result[2] = LineIntersectCircle(pt0,pt2,center,r0);
		}
	} else
	{
		//var w : float = blocker.transform.localScale.x;
		//var h : float = blocker.transform.localScale.z;
		var mat : Matrix4x4 = transform.worldToLocalMatrix * blocker.transform.localToWorldMatrix;
		
		
		var size : float = 0.5;
		// get the 4 corners
		temp = mat.MultiplyPoint(Vector3(-size,0,-size));corner[0]  = Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint(Vector3(-size,0,size));corner[1]  = Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint(Vector3(size,0,size));corner[2]  = Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint(Vector3(size,0,-size));corner[3]  = Vector2(temp.x,temp.z);
		var leftMost : int = 0;
		var rightMost : int = 0;
		
		
		for (i = 0; i < 4; i++)
		{
			angleCorner[i] = GetAngleValue(corner[i]);
			result[i] = Vector2.zero;
		}
		
		for (i = 1; i < 4; i++)
		{
			//if (corner[i].x < corner[leftMost].x) leftMost = i;
			//if ((corner[i].x / corner[i].y) < (corner[leftMost].x / corner[leftMost].y)) leftMost = i;
			//if ((corner[i].x / corner[i].y) > (corner[rightMost].x / corner[rightMost].y)) rightMost = i;
			//if (Vector2.Angle(corner[i],Vector2.up) < Vector2.Angle(corner[leftMost],Vector2.up)) leftMost = i;
			//if (Vector2.Angle(corner[i],Vector2.up) > Vector2.Angle(corner[rightMost],Vector2.up)) rightMost = i;
			
			if (angleCorner[i] < angleCorner[leftMost]) leftMost = i;
			if (angleCorner[i] > angleCorner[rightMost]) rightMost = i;
		}
		//rightMost = (leftMost + 2)%4;
		//Debug.Log("4 corner:" + corner[0] + " | "+ corner[1] + " | "+ corner[2] + " | "+ corner[3]);
		//Debug.Log("Left - right" + leftMost + "," + rightMost);
		
		var intersectPt1 : Vector2 = LineIntersectLine(pt0,pt1,corner[leftMost],corner[rightMost],false);
		var intersectPt2 : Vector2 = LineIntersectLine(pt0,pt2,corner[leftMost],corner[rightMost],false);
		var intersectPt3 : Vector2 = LineIntersectLine(pt1,pt2,corner[leftMost],corner[rightMost],false);
		//Debug.Log("Intersect Pts:" + intersectPt1 + " | " + intersectPt2 + "|" + intersectPt3);
		if (intersectPt1 != Vector2.zero)
		{
			result[1] = intersectPt1;
			
			if (intersectPt2 != Vector2.zero) // intersect 1,2
			{
				result[2] = intersectPt2;
			} else if (intersectPt3 != Vector2.zero) // intersect 1,3
			{
				result[2] = intersectPt3;
				result[3] = intersectPt3;
			} else // only intersect 1
			{
				result[2] = corner[rightMost];
				result[3] = LineIntersectLine(pt0,corner[rightMost],pt1,pt2,true);
			}
		} else
		{
			if (intersectPt2 != Vector2.zero)
			{
				result[2] = intersectPt2;
				if (intersectPt3 != Vector2.zero) // intersect 2,3
				{
					result[0] = intersectPt3;
					result[1] = intersectPt3;
				} else // intersect 2 only
				{
					result[0] = LineIntersectLine(pt0,corner[leftMost],pt1,pt2,true);
					result[1] = corner[leftMost];
				}
			} else 
			{
				if (intersectPt3 != Vector2.zero) // intersect 3 only
				{
					if (IsPointInTri(corner[leftMost],pt0,pt1,pt2)) // pt1 inside
					{
						result[0] = LineIntersectLine(pt0,corner[leftMost],pt1,pt2,true);
						result[1] = corner[leftMost];
						result[2] = intersectPt3;
						result[3] = intersectPt3;	
					} else // pt2 must be inside
					{
						result[0] = intersectPt3;
						result[1] = intersectPt3;
						result[2] = corner[rightMost];
						result[3] = LineIntersectLine(pt0,corner[rightMost],pt1,pt2,true);
					}
				} else if (IsPointInTri(corner[leftMost],pt0,pt1,pt2))// no intersections, both pts are inside triangle
				{
					result[0] = LineIntersectLine(pt0,corner[leftMost],pt1,pt2,true);
					result[1] = corner[leftMost];
					result[2] = corner[rightMost];
					result[3] = LineIntersectLine(pt0,corner[rightMost],pt1,pt2,true);
				}
			}
		}
		// below is old code
//		if (IsPointInAngle(corner[leftMost],pt0,pt1,pt2))
//		{
//			Debug.Log("Come here2");
//			result[0] = LineIntersectLine(pt0,corner[leftMost],pt1,pt2,true);
//			result[1] = corner[leftMost];
//		} else
//		{
//			result[1] = LineIntersectLine(pt0,pt1,corner[leftMost],corner[rightMost],true);
//		}
//		
//		if (IsPointInAngle(corner[rightMost],pt0,pt1,pt2))
//		{
//			Debug.Log("Come here3");
//			result[2] = corner[rightMost];
//			result[3] = LineIntersectLine(pt0,corner[rightMost],pt1,pt2,true);
//		} else
//		{
//			result[2] = LineIntersectLine(pt0,pt2,corner[leftMost],corner[rightMost],true);
//		}
	}
	//Debug.Log("Result is" + result);
	
	return result;
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

private function Process( blocker : GameObject )
{
	if (GetDistance(blocker) == INFINITY) return;
	var mesh : Mesh =  blocker.GetComponent(MeshFilter).mesh;
	Debug.Log("Process Blocker at position " + blocker.transform.position);
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
			Debug.Log(intersectPts[0] +","+intersectPts[1]+","+intersectPts[2]+","+intersectPts[3]);
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
	
	//Debug.Log(_tmpVertices[0] + ","+_tmpVertices[1] + ","+_tmpVertices[2]);
	//Debug.Log(_tmpVertices[0] + ","+_tmpVertices[3] + ","+_tmpVertices[4]);
	//Debug.Log(_tmpVertices[0] + ","+_tmpVertices[5] + ","+_tmpVertices[6]);

	Debug.Log("Triangle Count:" + _triangleCount);
	//_newVertices = _tmpVertices;
	for (i = 1 ; i <= 2*_triangleCount; i++)
	{
		_newVertices[i] = _tmpVertices[i];
		//Debug.Log(_newVertices[i]);
		//Debug.Log(_newTriangles[i]);
	}
	
}
