class_name Game extends Node2D

var timer: float = 0
var stepTime: float = 0.8

func _process(delta: float) -> void:
	timer += delta

	if timer > stepTime:
		EventBus.global_step.emit()
		timer = 0

	EventBus.global_frame.emit(timer / stepTime)
