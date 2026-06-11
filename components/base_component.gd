class_name  BaseComponent extends Node

var entity: MapObject
var sprite: Sprite2D

func _ready() -> void:
	entity = get_parent()
	sprite = entity.sprite

	entity.on_step.connect(step)
	entity.on_animate.connect(animate)

func step() -> void:
	print('step from base ' + name)
	pass

func animate(_t: float) -> void:
	pass
