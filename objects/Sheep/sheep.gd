@tool
class_name Sheep extends MapObject

@export var avoidDistance: float = 2
@export var target: MapObject

@onready var avoidingComponent: AvoidingComponent = $avoiding

func init_components():
	avoidingComponent.target = target
