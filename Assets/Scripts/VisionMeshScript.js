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

private var _triangleCount : int;

// cached variable
private var _corner : Vector2[] = new Vector2[4];
private var _angleCorner : float[] = new float[4];
private var _result : Vector2[] = new Vector2[4];

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
		_newVertices[i] = Vector3(0,0,0);
	}
	
	_triangleCount = 1;
	var pt1 : Vector3 = Vector3(-viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),0,viewDistance) ;
	var pt2 : Vector3 = Vector3(viewDistance*Mathf.Tan(Mathf.Deg2Rad*viewAngle),0,viewDistance);
	_newVertices[1] = pt1;
	_newVertices[2] = pt2;
	
	var blockers : GameObject[] ;
	blockers = BlockerManager.GetObjsInTriangle(transform.position, transform.localToWorldMatrix.MultiplyPoint(pt1),transform.localToWorldMatrix.MultiplyPoint(pt2));
	//blockers = BlockerManager.GetAllBlockers();
	
	for (var blocker: GameObject in BlockerManager.GetAllBlockers())
	{
		blocker.renderer.material.SetColor("_Color",Color.white);
	}
	
	Debug.Log("Visible blockers : " + blockers.Length);
	for (var blocker: GameObject in blockers)
	{
		//Debug.Log("Process blocker at:" + blocker.transform.position);
		blocker.renderer.material.SetColor("_Color",Color.red);
		Process(blocker);
	}
			
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
	
	//Debug.Log(_tmpVertices[0] + ","+_tmpVertices[1] + ","+_tmpVertices[2]);
	//Debug.Log(_tmpVertices[0] + ","+_tmpVertices[3] + ","+_tmpVertices[4]);
	//Debug.Log(_tmpVertices[0] + ","+_tmpVertices[5] + ","+_tmpVertices[6]);

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
		return INFINITY;
		// handle cylinder shape
		//var v : Vector4 = FindIntersectWith(blocker);
		distance = (_playerTransform.position - blocker.transform.position).magnitude 
		           - Mathf.Max(blocker.transform.localScale.x,blocker.transform.localScale.z);
		
		return (distance > viewDistance) ? INFINITY : distance;
	} else 
	{
		distance = (_playerTransform.position - blocker.transform.position).magnitude;
		
		return (distance > viewDistance) ? INFINITY : distance;
	}
	
	return INFINITY;
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
	//var _result : Vector4 = Vector4.zero;

	if (BlockerManager.IsCylinder(blocker))
	{
		// find the intersection of the triangle and the circle
		/*
		http://paulbourke.net/geometry/2circle/
		http://www.mathopenref.com/consttangents.html 
		*/
		//var point : Vector2 = Vector2(transform.position.x,transform.position.z);
		var point : Vector2 = Vector2.zero;
		//var center : Vector2 = Vector2(blocker.transform.position.x, blocker.transform.position.z);
		var temp : Vector3 = _playerTransform.InverseTransformPoint(blocker.transform.position);
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
			_result[0] = LineIntersectLine(pt0,tangent1,pt1,pt2,true);
			_result[1] = tangent1;
		} else
		{
			_result[1] = LineIntersectCircle(pt0,pt1,center,r0);
		}
		
		if (IsPointInTri(tangent2,pt0,pt1,pt2))
		{
			//Debug.Log("Come here3");
			_result[2] = tangent2;
			_result[3] = LineIntersectLine(pt0,tangent2,pt1,pt2,true);
		} else
		{
			_result[2] = LineIntersectCircle(pt0,pt2,center,r0);
		}
	} else
	{
		//var w : float = blocker.transform.localScale.x;
		//var h : float = blocker.transform.localScale.z;
		var mat : Matrix4x4 = _playerTransform.worldToLocalMatrix * blocker.transform.localToWorldMatrix;
		
		
		var size : float = 0.5;
		// get the 4 _corners
		temp = mat.MultiplyPoint3x4(Vector3(-size,0,-size));_corner[0]  = Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint3x4(Vector3(-size,0,size));_corner[1]  = Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint3x4(Vector3(size,0,size));_corner[2]  = Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint3x4(Vector3(size,0,-size));_corner[3]  = Vector2(temp.x,temp.z);
		var leftMost : int = 0;
		var rightMost : int = 0;
		
		
		for (var i : int = 0; i < 4; i++)
		{
			_angleCorner[i] = GetAngleValue(_corner[i]);
			_result[i] = Vector2.zero;
		}
		
		for (i = 1; i < 4; i++)
		{
			//if (_corner[i].x < _corner[leftMost].x) leftMost = i;
			//if ((_corner[i].x / _corner[i].y) < (_corner[leftMost].x / _corner[leftMost].y)) leftMost = i;
			//if ((_corner[i].x / _corner[i].y) > (_corner[rightMost].x / _corner[rightMost].y)) rightMost = i;
			//if (Vector2.Angle(_corner[i],Vector2.up) < Vector2.Angle(_corner[leftMost],Vector2.up)) leftMost = i;
			//if (Vector2.Angle(_corner[i],Vector2.up) > Vector2.Angle(_corner[rightMost],Vector2.up)) rightMost = i;
			
			if (_angleCorner[i] < _angleCorner[leftMost]) leftMost = i;
			if (_angleCorner[i] > _angleCorner[rightMost]) rightMost = i;
		}
		//rightMost = (leftMost + 2)%4;
		//Debug.Log("4 _corner:" + _corner[0] + " | "+ _corner[1] + " | "+ _corner[2] + " | "+ _corner[3]);
		//Debug.Log("Left - right" + leftMost + "," + rightMost);
		
		var intersectPt1 : Vector2 = LineIntersectLine(pt0,pt1,_corner[leftMost],_corner[rightMost],false);
		var intersectPt2 : Vector2 = LineIntersectLine(pt0,pt2,_corner[leftMost],_corner[rightMost],false);
		var intersectPt3 : Vector2 = LineIntersectLine(pt1,pt2,_corner[leftMost],_corner[rightMost],false);
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
				_result[2] = _corner[rightMost];
				_result[3] = LineIntersectLine(pt0,_corner[rightMost],pt1,pt2,true);
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
					_result[0] = LineIntersectLine(pt0,_corner[leftMost],pt1,pt2,true);
					_result[1] = _corner[leftMost];
				}
			} else 
			{
				if (intersectPt3 != Vector2.zero) // intersect 3 only
				{
					if (IsPointInTri(_corner[leftMost],pt0,pt1,pt2)) // pt1 inside
					{
						_result[0] = LineIntersectLine(pt0,_corner[leftMost],pt1,pt2,true);
						_result[1] = _corner[leftMost];
						_result[2] = intersectPt3;
						_result[3] = intersectPt3;	
					} else // pt2 must be inside
					{
						_result[0] = intersectPt3;
						_result[1] = intersectPt3;
						_result[2] = _corner[rightMost];
						_result[3] = LineIntersectLine(pt0,_corner[rightMost],pt1,pt2,true);
					}
				} else if (IsPointInTri(_corner[leftMost],pt0,pt1,pt2))// no intersections, both pts are inside triangle
				{
					_result[0] = LineIntersectLine(pt0,_corner[leftMost],pt1,pt2,true);
					_result[1] = _corner[leftMost];
					_result[2] = _corner[rightMost];
					_result[3] = LineIntersectLine(pt0,_corner[rightMost],pt1,pt2,true);
				}
			}
		}

	}
	//Debug.Log("Result is" + _result);
	
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

