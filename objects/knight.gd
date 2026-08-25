class_name Knight extends RigidBody2D

@onready var sprite: AnimatedSprite2D = $"sprite"
@onready var label: Label = $"label"

@export var power: float = 100
@export var base_animation_speed: float = 50

var v: Vector2 = Vector2(0, 0)
var dir_idx: int = 0

var timer: float = 0

var animations = [
	["e", false],
	["se", false],
	["s", false],
	["sw", "se"],
	["w", "e"],
	["nw", "ne"],
	["n", false],
	["ne", false],
]

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	lock_rotation = true


# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta: float) -> void:
func _physics_process(_delta: float) -> void:
	timer += _delta

	v = Vector2(0, 0)

	if Input.is_action_pressed("up"):
		v += Vector2(0, -1)
	if Input.is_action_pressed("right"):
		v += Vector2(1, 0)
	if Input.is_action_pressed("down"):
		v += Vector2(0, 1)
	if Input.is_action_pressed("left"):
		v += Vector2(-1, 0)

	v = v.normalized()

	if not v.is_equal_approx(Vector2(0, 0)):
		queue_redraw()
	else:
		pass
		
	var velocity = linear_velocity.length()
	
	var air_drag = velocity * 0.001

	apply_central_force(v * power - linear_velocity * air_drag)

	sprite.speed_scale = sqrt(velocity) / base_animation_speed

	label.text = str(snappedf(sqrt(velocity), 2))

	if (velocity > 0.01):
		var n = Vector2(-v.y, v.x)
		var n_force: float = n.x * linear_velocity.x + n.y * linear_velocity.y
		apply_central_force(-n_force * n * 0.63)

		var a = atan2(linear_velocity.y, linear_velocity.x)
		a = a + PI / 8
		if a < 0:
			a += TAU
		var idx: int = int(a / (TAU / 8.0))
		if dir_idx != idx:
			update_animation(idx)

func update_animation(idx: int):
	var a = animations[idx]
	dir_idx = idx
	# label.text = a[0] + ': ' + str(idx)
	if a[1]:
		sprite.animation = 'run-' + a[1]
		sprite.scale.x = -1
	else:
		sprite.animation = 'run-' + a[0]
		sprite.scale.x = 1

func _draw() -> void:
	draw_line(Vector2(0, 0), v * 0, Color(255, 0, 0))
