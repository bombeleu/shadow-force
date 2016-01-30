FBX file import:
- Name should carry a meaning: for example Floor1, floor2 or even better: floor\_steel, floor\_stone, etc...
- Uncheck: Generate colliders
- Up vector: Y axis (reset transform + rotate pivot)
- rotate after drag in: 0, 0, 0
- scale after drag in: 1, 1, 1
- Wall FBX: extend axis must be X
- Size: need to be relatively correct when import (not like 100 times bigger or smaller): better to make all asset in 1 3dsmax file & export 1 by 1, with a size reference (Titan height is about 2.5 unit in 3dsmax)
- Generate Lightmap UV: for all static object
- Animation: Don't import
- Material naming: Model's name + model material

Prefab making
- Common combination of assets should become a prefab. E.g: a light object with a light sharp.