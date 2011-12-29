#pragma strict
public class PopupMessage
{
	public var id : int;
	public var title : String;
	public var content : String;
	
	public function Draw()
	{
		GUI.Window(0, PopupManager.Instance.popupRect,DoWindow,title);
	}
	
	function DoWindow(windowID : int)
	{
		GUI.Label(PopupManager.Instance.rect,content);	        
	}
	
	public function ParseFromString(line : String)
	{
		var row : String[] = line.Split(","[0]);
        for (var i : int= 0; i < row.Length; i++) 
        {
            // This line was to replace "" with " 
            //row[i] = row[i].Replace("\"\"", "\"");
			row[i] = row[i].Replace("\"", "");
			//Debug.Log(row[i]);
        }
		// now, populate the data
		var index : int = 0;
		id = int.Parse(row[index++]);
		title = row[index++];
		content = row[index++];
	}
}

#if UNITY_FLASH
private var msgList : ArrayList = new ArrayList();
#else
private var msgList : List.<PopupMessage> = new List.<PopupMessage>();
#endif
private var msgPool : PopupMessage[];

public var popupRect : Rect;
public var rect : Rect;
public var style : GUIStyle;

public static var Instance : PopupManager;

function Awake()
{
	Instance = this;
}

function Start () {
	// get data from csv files
	var csvFile : TextAsset = Resources.Load("Messages") as TextAsset;
	var csvText : String = csvFile.text;
		
	var lines : String[] = csvText.Split("\n"[0]); 
	//Debug.Log(lines.Length);
	msgPool = new PopupMessage[lines.Length-1];
    
    //Debug.Log(csvText);
	for (var i : int = 1 ; i < lines.Length; i++)
	{
		msgPool[i-1] = new PopupMessage();
		msgPool[i-1].ParseFromString(lines[i]);
	}
}

public function AddPopupMessage(id : int)
{
	Time.timeScale = 0f;
	msgList.Add(msgPool[id]);
}

function RemoveMessage()
{
	Time.timeScale = 1f;
	msgList.RemoveAt(0);
}

function Update () {
	// test
//	if (Input.GetKeyUp(KeyCode.T))
//	{
//		AddPopupMessage(0);
//	}	
	
	if (msgList.Count == 0) return; 
	
	var bRead : boolean = false;
	
#if UNITY_IPHONE || UNITY_ANDROID			
	for (var i = 0; i < Input.touchCount; ++i) {
        if (Input.GetTouch(i).phase == TouchPhase.Began) {
    		bRead = true;
        }
    }
#else 
	if (Input.GetMouseButton(0))
	{
		bRead = true;
	}
#endif
    
    
    
    if (bRead)
    {
    	RemoveMessage();
    }
}

function OnGUI()
{
	if (msgList.Count > 0)
		#if UNITY_FLASH
		(msgList[0] as PopupMessage).Draw();
		#else
		msgList[0].Draw();
		#endif
}