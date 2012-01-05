#pragma strict

public var id : int;
public var title : String;
public var content : String;

public function Draw()
{
	//GUI.Window(0, PopupManager.Instance.popupRect,DoWindow,title);
	GUISizer.BeginGUI();
	GUI.depth = -100;
	var rect : Rect = PopupManager.Instance.popupRect;
	GUI.DrawTexture(rect,PopupManager.Instance.bgTexture);
	
	rect.height = PopupManager.Instance.titleHeight;
	GUI.DrawTexture(rect,PopupManager.Instance.titleTexture);
	
	GUI.Label(rect,title,PopupManager.Instance.titleStyle);
	
	rect.y += PopupManager.Instance.titleHeight ;
	rect.height = PopupManager.Instance.popupRect.height - PopupManager.Instance.titleHeight;
	GUI.Label(rect,content,PopupManager.Instance.contentStyle);
	
	GUISizer.EndGUI();
}


public function ParseFromString(line : String)
{
	//Debug.Log(line);
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