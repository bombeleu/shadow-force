#pragma strict


#if UNITY_FLASH
private var msgList : ArrayList = new ArrayList();
#else
private var msgList : List.<PopupMessage> = new List.<PopupMessage>();
#endif
//private var msgPool : PopupMessage[];

public var popupRect : Rect;
public var bgTexture : Texture;
public var titleTexture: Texture;
public var titleHeight : float;
public var titleStyle : GUIStyle;
public var contentStyle : GUIStyle;

public static var Instance : PopupManager;

function Awake()
{
	Instance = this;
}

function Start () {
	// get data from csv files
//	var csvFile : TextAsset = Resources.Load("Messages") as TextAsset;
//	var csvText : String = csvFile.text;
//		
//	var lines : String[] = csvText.Split("\n"[0]); 
//	//Debug.Log(lines.Length);
//	msgPool = new PopupMessage[lines.Length-1];
//    
//    //Debug.Log(csvText);
//	for (var i : int = 1 ; i < lines.Length; i++)
//	{
//		msgPool[i-1] = new PopupMessage();
//		msgPool[i-1].ParseFromString(lines[i]);
//	}
//	
	
}

//public function AddPopupMessage(id : int)
//{
//	Time.timeScale = 0f;
//	msgList.Add(msgPool[id]);
//}

public function AddPopupMessage(msg : PopupMessage)
{
	Time.timeScale = 0f;
	msgList.Add(msg);
}

function RemoveMessage()
{
	Time.timeScale = 1f;
	msgList.RemoveAt(0);
}

function Update () {
	// test
	
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
	{
		#if UNITY_FLASH
		(msgList[0] as PopupMessage).Draw();
		#else
		msgList[0].Draw();
		#endif
	}
}