
#pragma strict

class FadingData {
	public var material : Material;
	public var originalShader : Shader;
	public var replacedShader : Shader;	
	public var useTint : boolean ;
}

public var visibleObjects:GameObject[];
#if UNITY_FLASH
private var _dyVisibleObjects : ArrayList = new ArrayList();
#else
private var _dyVisibleObjects : List.<GameObject> = new List.<GameObject>();
#endif
public var fadingTime : float = 1.0; // in seconds

private var _alpha : float = 1.0;
enum FadingState { Out, In, None};
private var _fadingState : FadingState = FadingState.None;

private var visible : boolean = true;
private var _fadingData : ArrayList = new ArrayList();
private var _vision : VisionMeshScript ;
private var _textMesh : TextMesh;

function Start(){
	//Debug.Log("Start");
	Initialize();
}

function Initialize()
{
//	var nMaterials : int = 0;
//	for (var obj:GameObject in visibleObjects){
//		nMaterials += obj.renderer.materials.Length;
//	}	
//	for (var obj:GameObject in _dyVisibleObjects){
//		nMaterials += obj.renderer.materials.Length;
//	}
	// save the original shader
	// get corresponding replacement shader
	for (var data : FadingData in _fadingData) {
			data.material.shader = data.originalShader;
		}
		
	var weaponManager : WeaponManager = gameObject.GetComponent(WeaponManager);
	var weapon : Weapon = null;
	if (weaponManager) weapon = weaponManager.GetCurrentWeapon();

	var weaponRenderer:Renderer;
	if (weapon!=null) weaponRenderer = weapon.GetComponentInChildren(Renderer);
	//if (weapon != null) nMaterials += weaponRenderer.materials.Length;
	
	//_fadingData = new FadingData[nMaterials];
	//for (var i : int ; i < nMaterials; i++)
	//	_fadingData[i] = new FadingData(); // this is ridiculous !!!
	_fadingData.Clear();
	
	for (var obj:GameObject in visibleObjects){
		AddFadingData(obj);
		
	}
	for (var obj:GameObject in _dyVisibleObjects){
		AddFadingData(obj);
		
	}
	//Debug.Log("Weapon:" + weapon);
	// fade weapon
	if (weapon != null) 
	{
		//Debug.Log("Weapon render obj:" + weapon.gameObject);
		AddFadingData(weapon.gameObject);
	}

	//fade team name
	_textMesh = GetComponentInChildren(TextMesh);
	_vision = GetComponentInChildren(VisionMeshScript);
	//Debug.Log("Count :" + _fadingData.Count);
	// refresh state;
	if (enabled) OnEnable();
}

public function RemoveVisibleObject(go : GameObject)
{
	_dyVisibleObjects.Remove(go);
	Initialize();
}

public function AddVisibleObject(go : GameObject)
{
	// check for duplciation
	for (var obj:GameObject in visibleObjects)
	{
		if (go == obj) 
		{
			Debug.Log("Duplication visible object");
			return;
		}
	}
	
	_dyVisibleObjects.Add(go);
	
	Initialize();
}

private function AddFadingData( obj : GameObject) {
	//for (var mat : Material in obj.renderer.materials) {
	for (var ren : Renderer in obj.GetComponentsInChildren(Renderer)) {
		var mat : Material = (ren as Renderer).material;
		var fd : FadingData = new FadingData();
		fd.material = mat;
		fd.originalShader = mat.shader;
		//Debug.Log(mat);
		if (ren.GetType() == ParticleRenderer)
		{
			//Debug.Log(fd.material + "---" + ren);
			fd.replacedShader = mat.shader;
			fd.useTint = true;
		} else
		{
			fd.replacedShader = Shader.Find(mat.shader.name + "-Transparent");
			if (fd.replacedShader == null) {
				Debug.Log("Cannot match transparent shader:" + mat + "," + mat.shader.name);
				fd.replacedShader = Shader.Find("FateHunter/Character-Transparent"); // set to default shader
			}
			fd.useTint = false;
		}
		//Debug.Log(fd.replacedShader);
		_fadingData.Add(fd);
	}
}

private function SetRenderer(activate : boolean) {
	for (var obj:GameObject in visibleObjects){
		if (obj != null) 
		{
			//Debug.Log(obj);
			obj.renderer.enabled = activate;
		}
	}
	if (_vision != null) _vision.enabled = activate;
	if (_textMesh != null) _textMesh.gameObject.renderer.enabled = activate;
	
	var weaponManager : WeaponManager = gameObject.GetComponent(WeaponManager);
	var weapon : Weapon = null;
	if (weaponManager) weapon = weaponManager.GetCurrentWeapon();
	if (weapon) weapon.enabled = activate;
}

function OnEnable() {
	//ReplaceTransparentShader();
	for (var data : FadingData in _fadingData) {
		data.material.shader = data.replacedShader;
	}
	
	SetRenderer(true);
}

function OnDisable(){
	if (_fadingState == FadingState.In)
	{
		// replace original shader
		for (var data : FadingData in _fadingData) {
			data.material.shader = data.originalShader;
		}
	} else{
		SetRenderer(false);
	}
}
function OnSetVisible(visi:boolean){
	if (visi == visible) return;
	visible = visi;
	
	if (visible) _fadingState = FadingState.In;
	else _fadingState = FadingState.Out;
	enabled = true;
	
	//Debug.Log("Enemy set visible:" + visi);
	/*
	for (var obj:GameObject in visibleObjects){
		if (recursive){
			var rr : Renderer[] = obj.GetComponentsInChildren.<Renderer>();
			for (var r:Renderer in rr)
				r.enabled = visi;
		}else {
			obj.GetComponent.<Renderer>().enabled = visi;	
		}
	}
	if (!visi)
	{
		fade.FadeOut();
	} else
	{
		fade.FadeIn();
	}
	*/
}

function Update() {
	if (_fadingState == FadingState.None) return;
	
	var done:boolean = false;
	
	if (_fadingState == FadingState.Out){
		_alpha -= Time.deltaTime / fadingTime;
		if (_alpha<0){
			_alpha = 0;
			done = true;
		}
	} else {
		_alpha += Time.deltaTime / fadingTime;
		if (_alpha>1){
			_alpha = 1.0;
			done = true;
		}
	}
	
	for (var data : FadingData in _fadingData) {
		//Debug.Log(data.material + "---" + data.material.shader);
		if (data.useTint)
		{
			//Debug.Log(data.material);
			var col : Color = data.material.GetColor("_TintColor");
			col.a = _alpha;
			data.material.SetColor("_TintColor",col);
		} else
		{
			data.material.color.a = _alpha;
		}
	}

	if (_vision != null)
	{
		_vision.alpha = _alpha;
	}
	if (_textMesh != null) {
		//_textMesh.gameObject.renderer.material.SetColor("_Color",Color(1,1,1,_alpha));
		_textMesh.gameObject.renderer.material.color.a = _alpha;
	}
	
	if (done){
		enabled = false;
	}
}