class_name WanderingComponent extends BaseComponent

@onready var movable: MovableComponent = $"../movable"

var dirs = [
	Vector2i(1, 0),
	Vector2i(0, 1),
	Vector2i(-1, 0),
	Vector2i(0, -1)
]

func step() -> void:
	var p = entity.tilePosition
	var r = dirs[randi_range(0, 3)]
	#print('step ' + str(r.x) + ' ' + str(r.y))
	movable.setPosition(p + r)
