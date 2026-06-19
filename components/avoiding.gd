class_name AvoidingComponent extends BaseComponent

@export var target: MapObject
@export var nervousness: float = 0.5

@onready var movable: MovableComponent = $"../movable"

var dirs = [
	Vector2i(1, 0),
	Vector2i(0, 1),
	Vector2i(-1, 0),
	Vector2i(0, -1)
]

func step() -> void:
	var d = entity.tilePosition - target.tilePosition
	if (d.length_squared() > 2):
		if randf() > nervousness:
			print("Target is far away, resting")
			movable.standStill()
			return
		print("Target is far away, strolling")
		var r = dirs[randi_range(0, 3)]
		movable.addPosition(r)
		return
	var m = Vector2i(0, 0)
	if (abs(d.x) > abs(d.y)):
		print("Run aside!")
		m.x = sign(d.x)
	else:
		print("Run vertically!")
		m.y = sign(d.y)

	movable.addPosition(m)
