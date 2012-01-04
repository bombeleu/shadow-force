#pragma strict

function OnTriggerEnter (other : Collider) : void{
	var wm : WeaponManager = other.GetComponent(WeaponManager);
	if (wm){
		var weapons:Weapon[] = wm.GetAllWeapons();
		for (var wp:Weapon in weapons){
			if (wp.hasAmmo) wp.ammoRemain = wp.ammoCapacity;
		}
		Destroy(gameObject);
	}
}