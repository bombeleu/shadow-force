Shader "FateHunter/JTest" {
	Properties {
		//_VisionColor ("Vision Color", Color) = (1.0, 0.0, 1.0, 0.2)
		//_LightPos ("Light Position", Vector) = (0.0,0.0,0.0,1.0)
		//_Distance ("Distance",float) = 20
	}
	
	CGINCLUDE

		#include "UnityCG.cginc"

		fixed4 _VisionColor;
		half _Distance;
						
		struct v2f {
			half4 pos : SV_POSITION;
			float4 worldPos : TEXCOORD0;
		};

		v2f vert(appdata_base v) {
			v2f o;
			
			o.pos = mul (UNITY_MATRIX_MVP, v.vertex);	

			o.worldPos = v.vertex;
			
			//o.vertexColor.a = 0.2;
			return o; 
		}
		
		fixed4 frag( v2f i ) : COLOR {	
			float3 distV = i.worldPos.xyz ;
			float dist = length(distV);
			
			if (dist > _Distance) return fixed4(0,0,0,0);
			else return _VisionColor;
		}
	
	ENDCG
	
	SubShader {
		Tags { "RenderType" = "Transparent" "Queue" = "Transparent"}
		Cull Off
		Lighting Off
		ZWrite Off
		Fog { Mode Off }
		Blend SrcAlpha OneMinusSrcAlpha
		
	Pass {
	
		CGPROGRAM
		
		#pragma vertex vert
		#pragma fragment frag
		#pragma fragmentoption ARB_precision_hint_fastest 
		
		ENDCG
		 
		}
				
	} 
	FallBack Off
}
