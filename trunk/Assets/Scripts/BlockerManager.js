#pragma strict
class Cell {
	
	private var listObjs :List.<GameObject> = new List.<GameObject>();

	function Initialize()
	{
		//Debug.Log("Initialize");
	}
	
	function AddBlocker(obj : GameObject)
	{
		listObjs.Add(obj);	
	}
	
	function RemoveBlocker(obj : GameObject)
	{
		listObjs.Remove(obj);
	}
	
	function GetList() : List.<GameObject> 
	{
		return listObjs;
	}
}


public var NUM_TILES : int = 10;
public var MAP_SIZE : int = 100; 

private var CELL_SIZE :float ;
private var grid : Cell[,] = new Cell[NUM_TILES,NUM_TILES];

private var allBlockers : GameObject[];

public static var Instance : BlockerManager;

// Use this for initialization
function Awake () {//should be awake instead of Start, to use AddBlocker in Start of other scripts
	CELL_SIZE = MAP_SIZE/NUM_TILES;
	Debug.Log(CELL_SIZE + " ---- " + MAP_SIZE);
	for (var i : int = 0 ; i < NUM_TILES; i++)
	{
		for (var j:int = 0; j < NUM_TILES; j++)
		{
			//Debug.Log(grid[i,j]);
			grid[i,j] = new Cell();
			grid[i,j].Initialize();
		}
	}
	allBlockers  = GameObject.FindGameObjectsWithTag("Blocker");
	
	for (var blocker:GameObject in allBlockers)
	{
		AddBlocker(blocker);
	}
	// initialize map
	Debug.Log("Total: " + allBlockers.Length + " blockers");
	
	Instance = this;
}

public static function IsCylinder(blocker : GameObject) :boolean
{
	if (blocker.GetComponent(CapsuleCollider) != null) return true;
	else return false;
}

public static function IsCube( blocker: GameObject):boolean
{
	if (blocker.GetComponent(BoxCollider) != null) return true;
	else return false;
}

private function GetBlockerBoundaries(blocker : GameObject) : Vector4
{
	if (IsCube(blocker))
	{
		Debug.Log("Process Blocker Cube at " + blocker.transform.position);
		// now it's a cube, how to check which cell this cube intersects
		var mat : Matrix4x4 = blocker.transform.localToWorldMatrix;			
		var size : float = 0.5;
		var corner : Vector2[] = new Vector2[4];
		// get the 4 _corners
		var temp : Vector3;
		temp = mat.MultiplyPoint3x4( new Vector3(-size,0,-size));corner[0]  = new Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint3x4(new Vector3(-size,0,size));corner[1]  = new Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint3x4(new Vector3(size,0,size));corner[2]  = new Vector2(temp.x,temp.z);
		temp = mat.MultiplyPoint3x4(new Vector3(size,0,-size));corner[3]  = new Vector2(temp.x,temp.z);
		
		var smallest : Vector2 = corner[0];
		var largest : Vector2 = corner[0];
		//Debug.Log(corner[0] + "|"+corner[1] + "|"+corner[2] + "|"+corner[3] );
		//find smallest x, smallest y, largestX, largestY
		for (var i : int = 1 ; i < 4; i++)
		{
			if (smallest.x > corner[i].x) smallest.x = corner[i].x;
			if (smallest.y > corner[i].y) smallest.y = corner[i].y;
			if (largest.x < corner[i].x) largest.x = corner[i].x;
			if (largest.y < corner[i].y) largest.y = corner[i].y;
		}
		
	} else if (IsCylinder(blocker))
	{
		Debug.Log("Process Blocker Cylinder at " + blocker.transform.position);
		// now it's a cylinder, how to check which cell this cube intersects
		var capsule : CapsuleCollider = blocker.GetComponent(CapsuleCollider) ;
		
		var center : Vector2 = Vector2(capsule.center.x + blocker.transform.position.x, capsule.center.z + blocker.transform.position.z);
		var radius : float = capsule.radius * blocker.transform.localScale.x;
		
		Debug.Log("Center" + center + "|||"+ "radius:" + radius);
		smallest = center - Vector2(radius,radius);
		largest = center + Vector2(radius,radius);
	
	} else return Vector4.zero;
	
	return Vector4(smallest.x,largest.x,smallest.y,largest.y);
}

public function RemoveBlocker(blocker : GameObject)
{
	var boundary : Vector4 = GetBlockerBoundaries(blocker);
	
	//Debug.Log(smallest + "|||" + largest);
	for (var i : int = ToCell(boundary[0]) ; i <= ToCell(boundary[1]); i++)
	{
		for (var j : int = ToCell(boundary[2]) ; j <= ToCell(boundary[3]); j++)
		{
			grid[i,j].RemoveBlocker(blocker);
			Debug.Log("Remove Cell:" + i +","+j);	
		}
	}
}

public function AddBlocker(blocker : GameObject)
{
	var boundary : Vector4 = GetBlockerBoundaries(blocker);
	
	// add to proper cells
	//Debug.Log(smallest + "|||" + largest);
	for (var i : int = ToCell(boundary[0]) ; i <= ToCell(boundary[1]); i++)
	{
		for (var j : int = ToCell(boundary[2]) ; j <= ToCell(boundary[3]); j++)
		{
			Debug.Log("Add Cell:" + i +","+j);	
			grid[i,j].AddBlocker(blocker);
			//Debug.Log("Add Cell:" + i +","+j);	
		}
	}
}

private function ToCell(pos : float) : int
{
	var cell : int = (pos/CELL_SIZE) + NUM_TILES/2;
	if (cell < 0) return 0;
	else if (cell >= NUM_TILES) return NUM_TILES;
	else return cell;
}
	 
public function GetObjsInTriangle(pt0:Vector3, pt1:Vector3,pt2:Vector3) : GameObject[]
{
	var result : List.<GameObject>  = new List.<GameObject>();
	
	var smallest : Vector2;
	var largest : Vector2;
	// get the smallest and highest
	smallest.x = Mathf.Min(pt0.x,pt1.x,pt2.x);
	smallest.y = Mathf.Min(pt0.z,pt1.z,pt2.z);
	largest.x = Mathf.Max(pt0.x,pt1.x,pt2.x);
	largest.y = Mathf.Max(pt0.z,pt1.z,pt2.z);

	//Debug.Log("Cell : " + ToCell(smallest.x) + "," + ToCell(largest.x) + "," + ToCell(smallest.y) + "," + ToCell(largest.y));		
	for (var i : int = ToCell(smallest.x) ; i <= ToCell(largest.x); i++)
	{
		for (var j:int = ToCell(smallest.y) ; j <= ToCell(largest.y); j++)
		{
			//Debug.Log(blockerManager.grid[i,j]);
			//Debug.Log(blockerManager.grid[i,j].GetList());
			for (var go : GameObject in grid[i,j].GetList())
			{
				if (!result.Contains(go)) result.Add(go);
			}
		}
	}
//		var test : GameObject[] = result.ToArray();
//		for (i = 0 ; i < test.Length; i++)
//		{
//			Debug.Log(result[i].transform.position);
//		}
	return result.ToArray();
}

public function GetAllBlockers() : GameObject[]
{
	return allBlockers;
}

