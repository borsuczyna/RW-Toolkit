export enum RWVersion {
	GTAVC = 0x0C02FFFF,
	GTASA = 0x1803FFFF
}

export enum BlendMode {
    NOBLEND      = 0x00,
    ZERO         = 0x01,
    ONE          = 0x02,
    SRCCOLOR     = 0x03,
    INVSRCCOLOR  = 0x04,
    SRCALPHA     = 0x05,
    INVSRCALPHA  = 0x06,
    DESTALPHA    = 0x07,
    INVDESTALPHA = 0x08,
    DESTCOLOR    = 0x09,
    INVDESTCOLOR = 0x0A,
    SRCALPHASAT  = 0x0B,
}

export enum FilterMode {
	None				= 0x00,	// Filtering is disabled
	Nearest				= 0x01,	// Point sampled
	Linear				= 0x02,	// Bilinear
	MipNearest			= 0x03,	// Point sampled per pixel mip map
	MipLinear			= 0x04,	// Bilinear per pixel mipmap
	LinearMipNearest	= 0x05,	// MipMap interp point sampled
	LinearMipLinear		= 0x06,	// Trilinear
}

export enum MaterialEffect {
	None				= 0x00,	// No Effect
	BumpMap				= 0x01, // Bump Map
	EnvMap				= 0x02, // Environment Map (Reflections)
	BumpEnvMap			= 0x03, // Bump Map/Environment Map
	Dual				= 0x04, // Dual Textures
	UVTransform			= 0x05, // UV-Tranformation
	DualUVTransform		= 0x06, // Dual Textures/UV-Transformation
}

export enum LightType {
	Directional = 0x01,		// Directional light source
	Ambient = 0x02,			// Ambient light source
	Point = 0x80,			// Point light source
	Spot = 0x81,			// Spotlight
	SpotSoft = 0x82,		// Spotlight, soft edges
}

export enum LightFlag {
	Scene = 0x01,	// Lights all the atomics of the object.
	World = 0x02,	// Lights the entire world.
}

export enum Enum2DFX {
	Light = 0x00,
	ParticleEffect = 0x01,
	PedAttractor = 0x03,
	SunGlare = 0x04,
	EnterExit = 0x06,
	StreetSign = 0x07,
	TriggerPoint = 0x08,
	CovePoint = 0x09,
	Escalator = 0x0A
}